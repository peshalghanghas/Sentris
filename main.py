from fastapi import FastAPI
from api.routes import connect

app = FastAPI(
    title="Sentris AI",
    description="Proactive AI data analyst that watches your database so you don't have to",
    version="0.1.0"
)

#register route groups 
app.include_router(connect.router, prefix="/api", tags=["Database"])

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "product": "Sentris AI",
        "version": "0.1.0",
        "message": "Sentris is watching"
    }

@app.get("/")
def root():
    return {
        "product": "Sentris AI",
        "tagline": "Your data guardian",
        "version": "0.1.0",
        "docs": "/docs"
    }