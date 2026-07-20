from fastapi import APIRouter
from pydantic import BaseModel
from core.connector import DatabaseConnector
from typing import Dict

#Creates a router to roganize all database-related API endpoints.

router = APIRouter()

#Stores active database connections in memory
#key= connection name, value= databaseconnector object
active_connections: Dict[str, DatabaseConnector]= {}

#defines the data required to connect to a database
class ConnectRequest(BaseModel):
    database_url: str
    connection_name: str

#data required to execute a SQL query
class QueryRequest(BaseModel):
    connection_name: str
    sql: str

#connects to database and stores connection for future use
@router.post("/connect")
def connect_database(request: ConnectRequest):

#database connector created using provided database url
    connector= DatabaseConnector(request.database_url)

#try connecting to the database
    if not connector.connect():
        return{
            "success": False,
            "error":"Could not connect to database. Check your URL and credentials."
        }

#read the database schema (tables, columns, row counts)   
    schema = connector.get_schema()
    active_connections[request.connection_name] = connector

    return{
        "success": True,
        "connection_name": request.connection_name,
        "schema": schema
    }

#execute SQL query based on existing database connection
@router.post("/query")
def run_query(request: QueryRequest):
    if request.connection_name not in active_connections:
        return{"error": "No active connection with that name. Connect first."}
    return active_connections[request.connection_name].execute_query(request.sql)

#returns the schema of the connected database
@router.get("/schema/{connection_name}")
def get_schema(connection_name: str):

#check if requested connection exists
    if connection_name not in active_connections:
        return{"error": "No active connection with that name. Connect first."}

#return the database schema   
    return active_connections[connection_name].get_schema()