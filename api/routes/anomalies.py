from fastapi import APIRouter
from core.anomaly_detector import AnomalyDetector
from core.insight_generator import InsightGenerator
from api.routes.connect import active_connections

router = APIRouter()

insight_generator = InsightGenerator()


@router.get("/anomalies/{connection_name}")
def get_anomalies(connection_name: str, explain: bool = True):
    """
    Runs a full anomaly scan on any connected database.
    Auto-discovers all tables and columns worth monitoring.
    Only generates AI explanations for top 5 anomalies to keep response fast.
    """
    if connection_name not in active_connections:
        return {"error": "No active connection. Connect to a database first."}

    connector = active_connections[connection_name]
    schema = connector.get_schema()

    detector = AnomalyDetector(connector)
    scan_result = detector.run_full_scan(schema)

    if scan_result["total_anomalies"] == 0:
        return {
            "success": True,
            "message": "No anomalies detected. Your data looks healthy.",
            "tables_scanned": scan_result["tables_scanned"],
            "columns_scanned": scan_result["columns_scanned"],
            "monitorable_tables": scan_result["monitorable_tables"],
            "total_anomalies": 0,
            "anomalies": []
        }

    if explain and scan_result["anomalies"]:
        # Only explain top 5 anomalies to make responses quicker
        top_5 = scan_result["anomalies"][:5]
        rest = scan_result["anomalies"][5:]
        explained_top_5 = insight_generator.explain_all(top_5)
        scan_result["anomalies"] = explained_top_5 + rest

    return {
        "success": True,
        **scan_result
    }


@router.get("/anomalies/{connection_name}/summary")
def get_anomaly_summary(connection_name: str):
    """
    Returns just the count and severity breakdown.
    Faster — used for dashboard header. No AI calls.
    """
    if connection_name not in active_connections:
        return {"error": "No active connection. Connect to a database first."}

    connector = active_connections[connection_name]
    schema = connector.get_schema()

    detector = AnomalyDetector(connector)
    scan_result = detector.run_full_scan(schema)

    return {
        "success": True,
        "total_anomalies": scan_result["total_anomalies"],
        "severity_breakdown": scan_result["severity_breakdown"],
        "tables_scanned": scan_result["tables_scanned"],
        "columns_scanned": scan_result["columns_scanned"],
        "monitorable_tables": scan_result["monitorable_tables"],
        "scan_method": scan_result["scan_method"]
    }