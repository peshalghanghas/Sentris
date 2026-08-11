from openai import OpenAI
from core.prompt_templates import build_insight_prompt
import os
from dotenv import load_dotenv

load_dotenv()

class InsightGenerator:
    """
    takes a raw anomaly and turns it to plain english
    instead of: "z-score: -3.2, deviation: -86.9%"
    it says: "the revenus on july 7th was $420,
    which 86.9% below your daily average of $4,800.
    this appears to a weekend pattern - the business consistently
    sees very low activity on saturdays.
    consider running a friday email campaign to drive
    weekend sales."
    """

    def __init__(self):
        self.client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=os.getenv("NVIDIA_API_KEY")
        )
        self.model = "nvidia/nemotron-3-ultra-550b-a55b"

    def explain_anomaly(self, anomaly: dict) -> dict:
        """
        takes one anomaly dictionary and adds a
        plain english explanation to it.

        returns the same anomaly with an added
        'explanation' field containing nemotron's analysis.
        """

        prompt = build_insight_prompt(anomaly, [])

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                       "role": "system",
                       "content": "You are Sentris AI, a friendly data analyst. Explain data anomalies in plain English to non-technical business owners. Be specific with the actual numbers. Always end with one clear recommended action. Keep it under 3 sentences." 
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ], 
                temperature=0.3,
                max_tokens=150
            )

            explanation = response.choices[0].message.content.strip()

            return {
                **anomaly,
                "explanation": explanation,
                "has_insight": True
            }

        except Exception as e:
            # If Nemotron fails for any reason,
            # still return the anomaly with a basic fallback
            return {
                **anomaly,
                "explanation": (
                    f"{anomaly['metric_display']} was "
                    f"{anomaly['deviation_percent']}% below "
                    f"the expected value of {anomaly['expected_value']}."
                ),
                "has_insight": False,
                "insight_error": str(e)
            }

    def explain_all(self, anomalies: list) -> list:
        """
        Adds plain English explanations to every anomaly.
        Processes them one at a time.

        each call uses Nemotron credits.
        For a large number of anomalies this could
        be slow so caching will be added in a later version.
        """
        explained = []
        for anomaly in anomalies:
            explained_anomaly = self.explain_anomaly(anomaly)
            explained.append(explained_anomaly)
        return explained

