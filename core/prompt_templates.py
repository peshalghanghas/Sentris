def build_nl_to_sql_prompt(schema: dict, user_question: str) -> str:
    """
    Builds the instruction we send to Nemotron Ultra.
    Takes the database schema and user's question,
    returns a carefully crafted prompt.

    The quality of the prompt detemines how accurate
    Sentris's SQL generation is. (utilizes prompt engineering)
    """

    schema_text= ""
    for table_name, table_info in schema.items():
        schema_text += f"\nTable: {table_name} ({table_info['row_count']} rows)\n"
        schema_text += "Columns:\n"
        for col in table_info["columns"]:
            nullable = "optional" if col["nullable"] else "required"
            schema_text += f"  - {col['name']} ({col['type']}, {nullable})\n"

    prompt = f"""You are Sentris AI, a data analyst assistant.
You help business owners understand their data by converting their
plain English questions into SQL queries.

DATABASE SCHEMA (Use only these tables and columns):
{schema_text}

RULES YOU MUST FOLLOW:
1. Only write SELECT statements. Never write INSERT, UPDATE, DELETE, DROP, or ALTER.
2. Only use tables and columns that exist in the schema above.
3. Always use proper SQL syntax compatible with PostgreSQL.
4. If the question is unclear, write the most reasonable SQL interpretation.
5. Return ONLY the raw SQL query. No explanation. No markdown. No backticks.
6. String values in WHERE clauses are Title Case. Example: 'Completed' not 'completed', 'Pro' not 'pro', 'Enterprise' not 'enterprise'.

USER QUESTION:
{user_question}

SQL QUERY: """
    
    return prompt

def build_insight_prompt(anomaly : dict, historical_data: list) -> str:
    """
    Builds the prompt for explaining anomalies in plain English.
    """
    prompt = f"""You are Sentris AI, a proactive data analyst.
A business owner's database has shown an unusual pattern.

ANOMALY DETECTED:
- Metric: {anomaly.get('metric')}
- Current value: {anomaly.get('current_value')}
- Expected value: {anomaly.get('expected_value')}
- Deviation: {anomaly.get('deviation_percent')}% from normal

RECENT HISTORICAL DATA:
{historical_data}

Explain in 2-3 plain English sentences:
1. What happened
2. Why it might have happened
3. What the business owner should do about it

Write directly to a non-technical business owner.
Use the actual numbers. Be specific, not generic. """
    
    return prompt