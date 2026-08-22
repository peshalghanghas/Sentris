from fastapi import APIRouter
from core.anomaly_detector import AnomalyDetector
from core.insight_generator import InsightGenerator
from api.routes.connect import active_connections
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import json

router = APIRouter()

insight_generator = InsightGenerator()


# Data model for submitting feedback on an anomaly
class AnomalyFeedbackRequest(BaseModel):
    anomaly_id: str  # Unique identifier for the anomaly
    table_name: str
    column_name: str
    anomaly_value: Optional[float] = None
    detected_at: Optional[str] = None
    is_correct: bool  # true = real anomaly, false = false positive
    user_feedback: Optional[str] = None  # Why they marked it this way


@router.get("/anomalies/{connection_name}")
async def get_anomalies(connection_name: str, explain: bool = True):
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
async def get_anomaly_summary(connection_name: str):
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


# ============================================
# FEEDBACK ENDPOINTS - For Labeling Feature
# ============================================

@router.post("/anomalies/{connection_name}/feedback")
async def submit_anomaly_feedback(connection_name: str, feedback: AnomalyFeedbackRequest):
    """
    User marks an anomaly as correct or false positive.
    Stores feedback in database for model training/validation.
    Enables human-in-the-loop data collection at scale.
    """
    if connection_name not in active_connections:
        return {"error": "No active connection. Connect to a database first."}
    
    connector = active_connections[connection_name]
    
    # Generate unique anomaly ID if not provided
    anomaly_id = feedback.anomaly_id or f"{feedback.table_name}.{feedback.column_name}.{feedback.detected_at}"
    
    try:
        # Insert feedback into anomaly_feedback table
        query = """
        INSERT INTO anomaly_feedback 
        (anomaly_id, table_name, column_name, anomaly_value, detected_at, is_correct, user_feedback)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        
        params = (
            anomaly_id,
            feedback.table_name,
            feedback.column_name,
            feedback.anomaly_value,
            feedback.detected_at,
            feedback.is_correct,
            feedback.user_feedback
        )
        
        connector.execute_raw_query(query, params)
        
        return {
            "success": True,
            "message": "Feedback recorded successfully",
            "anomaly_id": anomaly_id,
            "marked_as": "correct" if feedback.is_correct else "false positive"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to record feedback: {str(e)}"
        }


@router.get("/anomalies/{connection_name}/feedback/accuracy")
async def get_feedback_accuracy(connection_name: str):
    """
    Returns labeling accuracy statistics.
    Shows how many anomalies were marked as correct vs false positives.
    Gives researchers real-time feedback on detection model quality.
    """
    if connection_name not in active_connections:
        return {"error": "No active connection. Connect to a database first."}
    
    connector = active_connections[connection_name]
    
    try:
        # Get accuracy stats
        query = """
        SELECT 
            COUNT(*) as total_labeled,
            SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) as correct_count,
            SUM(CASE WHEN is_correct = false THEN 1 ELSE 0 END) as false_positive_count,
            ROUND(100.0 * SUM(CASE WHEN is_correct = true THEN 1 ELSE 0 END) / COUNT(*), 2) as accuracy_percentage
        FROM anomaly_feedback
        """
        
        result = connector.execute_raw_query(query, None)
        
        if result and len(result) > 0:
            stats = result[0]
            return {
                "success": True,
                "total_labeled": stats[0],
                "correct_anomalies": stats[1],
                "false_positives": stats[2],
                "accuracy_percentage": stats[3]
            }
        else:
            return {
                "success": True,
                "total_labeled": 0,
                "correct_anomalies": 0,
                "false_positives": 0,
                "accuracy_percentage": 0,
                "message": "No feedback recorded yet"
            }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to get accuracy stats: {str(e)}"
        }


@router.get("/anomalies/{connection_name}/feedback/list")
async def get_feedback_list(connection_name: str, limit: int = 50):
    """
    Returns list of all feedback submitted (latest first).
    Useful for reviewing labeling history and data collection progress.
    """
    if connection_name not in active_connections:
        return {"error": "No active connection. Connect to a database first."}
    
    connector = active_connections[connection_name]
    
    try:
        query = """
        SELECT 
            anomaly_id, table_name, column_name, anomaly_value, 
            is_correct, user_feedback, created_at
        FROM anomaly_feedback
        ORDER BY created_at DESC
        LIMIT %s
        """
        
        results = connector.execute_raw_query(query, (limit,))
        
        feedback_list = []
        for row in results:
            feedback_list.append({
                "anomaly_id": row[0],
                "table_name": row[1],
                "column_name": row[2],
                "anomaly_value": row[3],
                "is_correct": row[4],
                "user_feedback": row[5],
                "created_at": row[6].isoformat() if row[6] else None
            })
        
        return {
            "success": True,
            "total_feedback": len(feedback_list),
            "feedback": feedback_list
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to retrieve feedback: {str(e)}"
        }