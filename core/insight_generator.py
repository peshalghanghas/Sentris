from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()


class InsightGenerator:
    """
    Takes a raw anomaly and turns it into a plain English
    explanation using Nemotron Ultra 550B on NVIDIA NIM.
    """

    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv("NVIDIA_API_KEY")
        )
        self.model = "nvidia/nemotron-3-ultra-550b-a55b"

    def explain_anomaly(self, anomaly: dict) -> dict:
        """
        Takes one anomaly and adds a plain English explanation.
        """
        direction = "dropped" if anomaly.get("direction") == "drop" else "increased"
        metric = anomaly.get("metric_display", "metric")
        current = anomaly.get("current_value", 0)
        expected = anomaly.get("expected_value", 0)
        deviation = abs(anomaly.get("deviation_percent", 0))
        date = str(anomaly.get("date", "")).split("T")[0].split(" ")[0]

        prompt = f"""On {date}, {metric} {direction} to {current} from the normal value of {expected}. This is a {deviation}% change.

Tell this business owner what happened and what to do. Two sentences only. Use the actual numbers."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a helpful business analyst. Be concise and direct."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.1,
                max_tokens=100
            )

            raw = response.choices[0].message.content.strip()
            cleaned = self._clean_response(raw)

            return {
                **anomaly,
                "explanation": cleaned,
                "has_insight": True
            }

        except Exception as e:
            # Fallback — build explanation from the numbers directly
            if direction == "dropped":
                explanation = (
                    f"{metric} dropped to {current} on {date}, "
                    f"which is {deviation}% below the expected {expected}. "
                    f"Check your data sources and sales channels immediately."
                )
            else:
                explanation = (
                    f"{metric} spiked to {current} on {date}, "
                    f"which is {deviation}% above the expected {expected}. "
                    f"Investigate whether this is a genuine sale or a data error."
                )
            return {
                **anomaly,
                "explanation": explanation,
                "has_insight": False
            }

    def _clean_response(self, text: str) -> str:
        """
        Removes any model thinking text or instruction echoing.
        """
        bad_phrases = [
            "the user wants",
            "let me analyze",
            "i need to",
            "i should",
            "let me think",
            "let me write",
            "write 2 sentences",
            "sentence 1:",
            "sentence 2:",
            "1. what happened",
            "2. what they",
            "start writing",
            "no preamble",
            "direct answers only",
            "no explanation of reasoning",
            "- direct",
            "data analyst",
            "two sentences only",
            "use the actual numbers",
            "tell this business",
        ]

        text_lower = text.lower()
        has_bad = any(phrase in text_lower for phrase in bad_phrases)

        if has_bad:
            lines = [l.strip() for l in text.split('\n') if l.strip()]
            clean_lines = []
            for line in lines:
                line_lower = line.lower()
                is_bad = any(phrase in line_lower for phrase in bad_phrases)
                is_numbered = len(line) > 2 and line[0].isdigit() and line[1] == '.'
                starts_with_dash = line.startswith('-') and len(line) < 40
                if not is_bad and not is_numbered and not starts_with_dash:
                    clean_lines.append(line)
            if clean_lines:
                return ' '.join(clean_lines[:2])

        return text

    def explain_all(self, anomalies: list) -> list:
        """
        Adds plain English explanations to every anomaly.
        """
        explained = []
        for anomaly in anomalies:
            explained_anomaly = self.explain_anomaly(anomaly)
            explained.append(explained_anomaly)
        return explained