from fastapi import APIRouter
from core.anomaly_detector import AnomalyDetector
from core.insight_generator import InsightGenerator
from api.routes.connect import active_connections

router = APIRouter()

insight_generator = InsightGenerator()


@router.get("/anomalies/{connection_name}")
def get_anomalies(connection_name: str, explain: bool = True):
    """
    Runs a full anomaly scan on any connected DB.

    Auto-discovers all tables and columns for monitoring.
    works on any database structure.

    Parameters:
    - connection_name: name you used when connecting
    - if True, Nemotron adds plain English
    explanations to each anomaly (default True)

    sentris is proactive
    It finds problems without anyone asking.
    """
    if connection_name not in active_connections:
        return {
            "error": "No active connection. Connect to a database first."
        }

    connector = active_connections[connection_name]

    # Get schema so detector knows what exists
    schema = connector.get_schema()

    # Run full scan across all discovered tables and columns
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
        scan_result["anomalies"] = insight_generator.explain_all(
            scan_result["anomalies"]
        )

    return {
        "success": True,
        **scan_result
    }


@router.get("/anomalies/{connection_name}/summary")
def get_anomaly_summary(connection_name: str):
    """
    Returns just the count and severity breakdown
    Faster than full scan
    No Nemotron calls
    """
    if connection_name not in active_connections:
        return {
            "error": "No active connection. Connect to a database first."
        }

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