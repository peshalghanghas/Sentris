from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import connect
from api.routes import anomalies

app = FastAPI(
    title="Sentris AI",
    description="Proactive AI data analyst — watches your database so you don't have to",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://sentris.vercel.app",
        "https://sentris-app.vercel.app",
        "https://sentrisai.vercel.app",
        "https://sentris-sage.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(connect.router, prefix="/api", tags=["Database"])
app.include_router(anomalies.router, prefix="/api", tags=["Anomalies"])


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