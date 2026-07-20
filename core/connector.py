''' 
SQLAlchemy tools:-
Create_engine= conneciton manager to db
text= execute raw sql queries
inspect= examine db structure like tables and columns
'''
from sqlalchemy import create_engine, text, inspect
from dotenv import load_dotenv

load_dotenv()
'''
 handles all communication between sentris and the db, 
 creates a db connection, checks availability, reads db structure, 
 executes sql query and closes the connection.
'''
class DatabaseConnector:
    def __init__(self, database_url:str):
        self.database_url=database_url
        self.engine=None #no connection exists initially
        #engine object will be created afte connect () is called

    def connect(self):
        try:
            self.engine= create_engine(self.database_url)
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1")) #checks if the database responds
            print("Sentris connected to database successfully")
            return True
        except Exception as e:
            print(f"Connection failed: {e}")
            return False
# retrieves information about the db structure, such as columns from the current table
# the number of records from the sql result    
    def get_schema(self):
        if not self.engine:
            return{"error": "Not connected to a database"}
        
        inspector = inspect(self.engine)
        schema={}

        for table_name in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table_name):
                columns.append({
                    "name":column["name"],
                    "type": str(column["type"]),
                    "nullable": column.get("nullable", True)
                })

            with self.engine.connect() as conn:
                result= conn.execute(
                    text(f"SELECT COUNT(*) FROM {table_name}")
                )
                row_count= result.scalar()

            schema[table_name] = {
                "columns": columns,
                "row_count": row_count
            }

        return schema

    def execute_query(self, sql: str):
        if not self.engine:
            return{"error": "Not connected to a database"}

        try:
            with self.engine.connect() as conn:
                result= conn.execute(text(sql))
                rows = result.fetchall()
                columns= list(result.keys())

# convert db into a json friendly format

                return{
                    "columns":columns,
                    "rows": [dict(zip(columns, row)) for row in rows],
                    "row_count": len(rows)
                }

        except Exception as e:
            return{"error": str(e)}
        
# closes the db connection when the application shuts down
  
    def close(self):
        if self.engine:
            self.engine.dispose()
            print("Database connection closed")