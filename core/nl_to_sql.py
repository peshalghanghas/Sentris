from openai import OpenAI
import sqlglot
from core.prompt_templates import build_nl_to_sql_prompt
import os
from dotenv import load_dotenv

load_dotenv()

class NLToSQLEngine:
    """
    The brain of Sentris.
    Takes a plain English question + database schema
    and returns a validated, safe SQL query.

    Uses NVIDIA's Nemotron Ultron 550B
    """

    def __init__(self):
        self.client = OpenAI(
            base_url = "https://integrate.api.nvidia.com/v1",
            api_key = os.getenv("NVIDIA_API_KEY")
        )

        self.model = "nvidia/nemotron-3-ultra-550b-a55b"

    def generate_sql(self, question: str, schema:dict) -> dict:
        """
        Main method. Takes an english question with schema,
        return a validated SQL query.

        1. Build prompt with schema and question
        2. Send to Nemotron Ultra via NVIDIA NIM
        3. Clean the response
        4. Validate SQL syntax with sqlglot
        5. Safety check (block DROP, DELETE, etc)
        6. Return the clean and validated SQL
        """

        prompt = build_nl_to_sql_prompt(schema, question)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content":"You are a SQL expert. Return only valid PostgreSQL SELECT queries. No markdown, no explanation, no backticks. Raw SQL only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature = 0.1,
                max_tokens=500
            )

            sql_query = response.choices[0].message.content.strip()
            
            sql_query = self._clean_sql(sql_query)

            validation= self.validate_sql(sql_query)
            if not validation["valid"]:
                return {
                    "success": False,
                    "error": f"Generated invalid SQL: {validation['error']}",
                    "raw_response": sql_query
                }
            
            safety = self.safety_check(sql_query)
            if not safety["safe"]:
                return{
                    "success": False,
                    "error": f"Query blocked: {safety['reason']}"
                }
            
            return {
                "success": True,
                "sql": sql_query,
                "question": question,
                "model": "nemotron-ultra-550b",
                "tokens_used": response.usage.total_tokens
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": f"NVIDIA NIM error: {str(e)}"
            }
        
    def _clean_sql(self, sql: str) -> str:
        """
        Removes markdown formatting that Nemotron adds sometimes
        Input might be:
        ```sql
        SELECT * from Customers
        ```
        Output will be:
        SELECT * FROM Customers
        """

        if sql.startswith("```"):
            lines = sql.split("\n")
            sql = "\n".join(lines[1:-1]).strip()

        sql = sql.replace("`", "").strip()

        return sql
    
    def validate_sql(self, sql: str) -> dict:
        """
        Uses sqlglot to parse and validate SQL syntax.
        Catches errors before they hit your real database.

        Example:
        'SELCT * FROM Customers' is invalid, caught here
        'SELECT * FROM Customer' is valid, passes through
        """

        try:
            sqlglot.parse_one(sql, dialect="postgres")
            return {"valid": True}
        except sqlglot.errors.ParseError as e:
            return {
                "valid": False,
                "error": str(e)
            }
        
    def safety_check(self, sql: str) -> dict:
        """
        Blocks any SQL that could modify or destroy data.

        Sentris is read only - it never changes a customer's 
        data under any circumstances. This is a core architectural
        decision built in from day one.

        """

        sql_upper = sql.upper().strip()

        dangerous_keywords = [
            "DROP", "DELETE", "INSERT",
            "UPDATE", "ALTER", "TRUNCATE",
            "CREATE", "REPLACE"
        ]

        for keyword in dangerous_keywords:
            if keyword in sql_upper:
                return{
                    "safe": False,
                    "reason": f"Forbidden keyword: {keyword}. Sentris only reads data, never modifies it."
                }
        
        return {"safe": True}
