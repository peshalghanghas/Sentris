import pandas as pd
import numpy as np
from scipy import stats
from core.connector import DatabaseConnector


class AnomalyDetector:
    """
    Sentris's anomaly detection engine.

    Automatically discovers every table and column
    in any connected database and flags unusual patterns
    without any hardcoding or configuration.

    Based on statistical methods from:
    'AI-based Immune System for Fraud Detection'
    Ghanghas et al., IITCEE 2024 (IEEE)
    """

    def __init__(self, connector: DatabaseConnector):
        self.connector = connector
        self.z_score_threshold = 2.0
        self.wow_threshold = -0.40
        self.min_rows = 7

        self.date_column_hints = [
            "date", "created_at", "updated_at", "timestamp",
            "time", "day", "week", "month", "created",
            "recorded_at", "order_date", "transaction_date"
        ]

        self.numeric_column_hints = [
            "revenue", "amount", "total", "sales", "price",
            "count", "orders", "transactions", "value", "sum",
            "profit", "loss", "balance", "quantity", "volume",
            "customers", "users", "signups", "clicks", "views",
            "conversion", "churn", "refund", "cost", "spend",
            "income", "payment", "fee", "tax", "discount"
        ]

        self.skip_column_hints = [
            "id", "uuid", "code", "key", "hash",
            "password", "token", "email", "phone",
            "address", "name", "description", "status",
            "type", "category", "tag", "label", "flag"
        ]

    def discover_monitorable_columns(self, schema: dict) -> list:
        """
        Automatically discovers which tables and columns
        are worth monitoring for anomalies.
        """
        monitorable = []

        for table_name, table_info in schema.items():
            columns = table_info["columns"]
            row_count = table_info["row_count"]

            if row_count < self.min_rows:
                continue

            date_column = None
            for col in columns:
                col_name = col["name"].lower()
                col_type = col["type"].lower()

                if any(t in col_type for t in ["date", "timestamp", "time"]):
                    date_column = col["name"]
                    break

                if any(hint in col_name for hint in self.date_column_hints):
                    date_column = col["name"]
                    break

            if not date_column:
                continue

            numeric_columns = []
            for col in columns:
                col_name = col["name"].lower()
                col_type = col["type"].lower()

                if col["name"] == date_column:
                    continue

                if any(hint in col_name for hint in self.skip_column_hints):
                    continue

                is_numeric_type = any(t in col_type for t in [
                    "int", "float", "decimal", "numeric",
                    "double", "real", "money", "number", "bigint"
                ])

                is_metric_name = any(
                    hint in col_name for hint in self.numeric_column_hints
                )

                if is_numeric_type or is_metric_name:
                    numeric_columns.append(col["name"])

            if numeric_columns:
                monitorable.append({
                    "table": table_name,
                    "date_column": date_column,
                    "numeric_columns": numeric_columns,
                    "row_count": row_count
                })

        return monitorable

    def scan_table_column(self, table: str, date_column: str, numeric_column: str) -> list:
        """
        Runs anomaly detection on one specific
        table + date column + numeric column combination.
        """
        query = f"""
            SELECT {date_column}, {numeric_column}
            FROM {table}
            WHERE {numeric_column} IS NOT NULL
            ORDER BY {date_column}
        """

        result = self.connector.execute_query(query)

        if "error" in result:
            return []

        if result["row_count"] < self.min_rows:
            return []

        df = pd.DataFrame(result["rows"])

        try:
            df[numeric_column] = pd.to_numeric(df[numeric_column])
        except Exception:
            return []

        if df[numeric_column].sum() == 0:
            return []

        anomalies = []
        mean_val = df[numeric_column].mean()
        z_scores = stats.zscore(df[numeric_column])

        for i, z_score in enumerate(z_scores):
            if abs(z_score) > self.z_score_threshold:
                row = df.iloc[i]
                current_val = float(row[numeric_column])

                deviation_percent = round(
                    ((current_val - mean_val) / mean_val) * 100, 1
                ) if mean_val != 0 else 0

                direction = "spike" if z_score > 0 else "drop"

                anomalies.append({
                    "table": table,
                    "date": str(row[date_column]),
                    "metric": f"{table}.{numeric_column}",
                    "metric_display": numeric_column.replace("_", " ").title(),
                    "current_value": round(current_val, 2),
                    "expected_value": round(float(mean_val), 2),
                    "deviation_percent": deviation_percent,
                    "z_score": round(float(z_score), 2),
                    "severity": self._calculate_severity(z_score),
                    "direction": direction,
                    "detection_method": "Z-Score (Negative Selection)"
                })

        if len(df) >= 8:
            for i in range(7, len(df)):
                current = float(df.iloc[i][numeric_column])
                previous = float(df.iloc[i - 7][numeric_column])

                if previous == 0:
                    continue

                wow_change = (current - previous) / previous

                if wow_change < self.wow_threshold:
                    date_val = str(df.iloc[i][date_column])

                    already_flagged = any(
                        a["date"] == date_val and
                        a["metric"] == f"{table}.{numeric_column}"
                        for a in anomalies
                    )

                    if not already_flagged:
                        anomalies.append({
                            "table": table,
                            "date": date_val,
                            "metric": f"{table}.{numeric_column}",
                            "metric_display": numeric_column.replace("_", " ").title(),
                            "current_value": round(current, 2),
                            "expected_value": round(previous, 2),
                            "deviation_percent": round(wow_change * 100, 1),
                            "z_score": None,
                            "severity": "Medium" if wow_change > -0.6 else "High",
                            "direction": "drop",
                            "detection_method": "Week-over-Week"
                        })

        return anomalies

    def run_full_scan(self, schema: dict = None) -> dict:
        """
        The main method — this is what the API calls.

        Automatically discovers every monitorable table
        and column, runs both detection methods on all
        of them, and returns a combined summary.

        Works on ANY database. No configuration needed.
        """
        if schema is None:
            schema = self.connector.get_schema()

        monitorable = self.discover_monitorable_columns(schema)

        if not monitorable:
            return {
                "total_anomalies": 0,
                "severity_breakdown": {
                    "high": 0,
                    "medium": 0,
                    "low": 0
                },
                "anomalies": [],
                "tables_scanned": 0,
                "columns_scanned": 0,
                "monitorable_tables": [],
                "scan_method": "Z-Score + Week-over-Week (Based on IEEE AIS Research)"
            }

        all_anomalies = []
        total_columns_scanned = 0

        for target in monitorable:
            for numeric_col in target["numeric_columns"]:
                column_anomalies = self.scan_table_column(
                    table=target["table"],
                    date_column=target["date_column"],
                    numeric_column=numeric_col
                )
                all_anomalies.extend(column_anomalies)
                total_columns_scanned += 1

        severity_order = {"High": 0, "Medium": 1, "Low": 2}
        all_anomalies.sort(
            key=lambda x: (severity_order.get(x["severity"], 3), x["date"])
        )

        high = sum(1 for a in all_anomalies if a["severity"] == "High")
        medium = sum(1 for a in all_anomalies if a["severity"] == "Medium")
        low = sum(1 for a in all_anomalies if a["severity"] == "Low")

        return {
            "total_anomalies": len(all_anomalies),
            "severity_breakdown": {
                "high": high,
                "medium": medium,
                "low": low
            },
            "tables_scanned": len(monitorable),
            "columns_scanned": total_columns_scanned,
            "monitorable_tables": [m["table"] for m in monitorable],
            "anomalies": all_anomalies,
            "scan_method": "Z-Score + Week-over-Week (Based on IEEE AIS Research)"
        }

    def _calculate_severity(self, z_score: float) -> str:
        """
        Converts a Z-score into a human readable severity level.
        Uses abs() to handle both spikes and drops.
        """
        abs_z = abs(z_score)

        if abs_z > 3.0:
            return "High"
        elif abs_z > 2.5:
            return "Medium"
        else:
            return "Low"