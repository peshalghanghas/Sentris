# Deployment Guide — Sentris AI

## Architecture Overview

Sentris is deployed across three cloud platforms:

**Frontend** → Vercel (React + Vite)
**Backend** → Render (FastAPI + Python)
**Database** → Supabase (PostgreSQL)

## Frontend Deployment (Vercel)

- Build: `cd frontend && npm run build`
- Output: `frontend/dist`
- Environment: `VITE_API_URL=https://sentris-api.onrender.com`
- Auto-deploys on every push to main

Live: https://sentris-sage.vercel.app

## Backend Deployment (Render)

- Environment: Python 3.11+
- Build: `pip install -r requirements.txt`
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Environment Variables:
  - `NVIDIA_API_KEY`
  - `DATABASE_URL`
  - `ENVIRONMENT=production`
- Auto-deploys on every push to main

Live: https://sentris-api.onrender.com
API Docs: https://sentris-api.onrender.com/docs

## Database Deployment (Supabase)

PostgreSQL hosted on AWS us-east-2 with managed backups.

Feedback table for labeling system:
```sql
CREATE TABLE anomaly_feedback (
    id SERIAL PRIMARY KEY,
    anomaly_id TEXT NOT NULL,
    table_name TEXT NOT NULL,
    column_name TEXT NOT NULL,
    anomaly_value FLOAT,
    detected_at TIMESTAMP,
    is_correct BOOLEAN,
    user_feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## Local Development

### Backend
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `GET /api/anomalies/{connection_name}` — Run anomaly scan
- `POST /api/anomalies/{connection_name}/feedback` — Submit feedback
- `GET /api/anomalies/{connection_name}/feedback/accuracy` — Accuracy stats
- `POST /api/connect` — Connect to database
- `POST /api/ask` — Natural language to SQL
- `GET /api/schema/{connection_name}` — Get database schema

## Performance

- Anomaly detection: <3 seconds
- FastAPI async endpoints for concurrent requests
- React lazy loading for frontend
- Supabase connection pooling for database
