# Sentris AI — From Database to Decisions

> Proactive AI data analyst. Connects to any database, detects anomalies automatically, and answers plain English questions about your data. No SQL required.

**Live:** [sentris-landing.vercel.app](https://sentris-landing.vercel.app) · [Try the app](https://sentris-sage.vercel.app) · [API](https://sentris-api.onrender.com/docs)

---

## What it does

Most data tools wait for you to ask a question. Sentris watches your database 24/7 and finds problems before you know to look — then explains them in plain English.

- **Natural language to SQL** — type "who are my top 5 customers by spending?" and get a chart and table back instantly
- **Proactive anomaly detection** — automatically scans every table and column, flags unusual patterns using Z-score analysis and week-over-week comparison
- **AI explanations on demand** — each anomaly card has a one-click explanation powered by NVIDIA Nemotron Ultra 550B
- **Auto-detecting charts** — results render as line charts, bar charts, or tables depending on the data shape
- **Works on any database** — auto-discovers schema with zero configuration. Tested on both a custom Sentris demo database and the industry-standard Chinook database

---

## Demo

Connect the live demo to the Chinook music database (no sign-up, no setup):

[**→ Try the live demo**](https://sentris-sage.vercel.app)

Suggested queries to try:
- "Who are the top 5 artists by number of albums?"
- "Show me total invoice revenue by month"
- "Which genre has the most tracks?"
- "What are the top 10 best selling tracks?"

---

## Tech Stack

### Backend
| Tool | Purpose |
|---|---|
| Python 3.13 + FastAPI | REST API, async endpoints, auto-generated Swagger docs |
| SQLAlchemy | Universal database connector |
| Pandas + SciPy | Anomaly detection, Z-score calculation, time-series analysis |
| sqlglot | SQL syntax validation before execution |
| NVIDIA NIM | Inference infrastructure |
| Nemotron Ultra 550B | NL to SQL generation and anomaly explanation |
| Render | Backend hosting (free tier) |

### Frontend
| Tool | Purpose |
|---|---|
| React 18 + Vite | UI framework |
| Tailwind CSS | Styling |
| Recharts | Auto-detecting data visualization |
| Lucide React | Icons |
| Axios | API calls |
| Vercel | Frontend hosting (free tier) |

### Database & Infrastructure
| Tool | Purpose |
|---|---|
| PostgreSQL | Primary database |
| Supabase | Managed cloud PostgreSQL with session pooler |
| GitHub Actions | CI/CD |

---

## Supported Databases

Sentris works with any standard PostgreSQL connection string. No special setup, no proprietary drivers.

```
postgresql://username:password@hostname:5432/database_name
```

### Providers that work out of the box

| Provider | Type | Notes |
|---|---|---|
| Supabase | Managed PostgreSQL | Use Session Pooler URL (port 5432) |
| Neon | Managed PostgreSQL | Works directly |
| Railway | Managed PostgreSQL | Works directly |
| AWS RDS | Managed PostgreSQL | Works directly |
| Google Cloud SQL | Managed PostgreSQL | Works directly |
| Azure Database | Managed PostgreSQL | Works directly |
| Render PostgreSQL | Managed PostgreSQL | Works directly |
| Self-hosted | Any PostgreSQL server | Must be publicly accessible |
| Local PostgreSQL | Your laptop | Only works when running Sentris locally |

> **Note:** Local databases on your laptop are not reachable from the live Render backend. To connect a local database, run Sentris locally using the setup instructions below.

---

## FAQ

**Does it work with MySQL or SQLite?**
Not yet. PostgreSQL only for now. MySQL and SQLite support is planned.

**Does Sentris store my data?**
No. Sentris reads your database to answer queries and detect anomalies. It never writes to your database and never stores your data on its own servers.

**Is my database password safe?**
Your connection string is sent to the Sentris backend over HTTPS and used only to establish a read-only connection. It is never logged, stored, or sent to any third party including NVIDIA — only your query results and schema are sent for AI processing.

**What gets sent to NVIDIA?**
Only two things: your database schema (table names, column names, data types) and your query or anomaly data. Your actual row data is never sent to NVIDIA — the AI sees the structure, not the contents.

**Can Sentris modify my database?**
No. Only SELECT statements are allowed. DROP, DELETE, INSERT, UPDATE, ALTER and TRUNCATE are all blocked at the application layer before any query reaches your database.

**What if my database has 50 tables?**
Sentris auto-discovers all of them. The anomaly scanner filters for tables that have both a date column and numeric columns worth monitoring, so irrelevant tables are skipped automatically.

**How long does a scan take?**
The detection scan runs in under 3 seconds regardless of database size. AI explanations are generated on demand per anomaly card, not in batch.

---

## Architecture

```
User (Browser)
     │
     ▼
React Frontend (Vercel)
     │  Axios HTTP calls
     ▼
FastAPI Backend (Render)
     │
     ├── /api/connect   → DatabaseConnector → SQLAlchemy → Any PostgreSQL DB
     │
     ├── /api/ask       → NLToSQLEngine → NVIDIA NIM (Nemotron 550B)
     │                                  → SQL Validator (sqlglot)
     │                                  → DatabaseConnector (execute)
     │
     ├── /api/anomalies → AnomalyDetector → Z-Score (SciPy)
     │                                    → Week-over-Week (Pandas)
     │                                    → InsightGenerator → NVIDIA NIM
     │
     └── /api/query     → DatabaseConnector → Raw SQL execution
```

---

## Anomaly Detection — Research Background

The anomaly detection engine is based on published IEEE research:

**"Heuristic Artificial Negative Selection for Cybersecurity: Evaluating AIS-Based Intrusion Detection in Modern Network Environments"**
*Peshal Ghanghas et al. — IITCEE 2024 (IEEE)*

The Z-score statistical baseline in Sentris mirrors the **self model** in the Negative Selection Algorithm from that paper. Normal behavior is defined statistically — anything significantly outside that range is flagged as anomalous.

**Detection methods:**

| Method | Threshold | What it catches |
|---|---|---|
| Z-Score (Negative Selection) | \|z\| > 2.0 | Values far from historical mean |
| Week-over-Week | > 40% drop | Gradual declines Z-score might miss |

**Severity classification:**

| Z-Score | Severity |
|---|---|
| \|z\| > 3.0 | 🔴 High |
| \|z\| > 2.5 | 🟡 Medium |
| \|z\| > 2.0 | 🔵 Low |

**Auto-discovery:** The detector reads the database schema and automatically identifies which tables have date columns and numeric columns worth monitoring. No hardcoding — works on any database structure.

---

## Security

Built read-only from day one:

- **SELECT-only enforcement** — DROP, DELETE, INSERT, UPDATE, ALTER, TRUNCATE all blocked at the application layer
- **SQL validation** — sqlglot parses every AI-generated query before execution. Syntax errors caught before they hit the database.
- **Credential safety** — database URLs are never stored or logged. Input uses `type="password"`.
- **CORS** — restricted to specific Vercel and localhost origins only
- **Demo credentials** — stored as Vercel environment variable, never in code or GitHub

---

## Local Development

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL (any provider — see Supported Databases above)

### Backend setup

```bash
git clone https://github.com/peshalghanghas/Sentris.git
cd Sentris

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
# Fill in your NVIDIA_API_KEY and DATABASE_URL

uvicorn main:app --reload
```

Backend runs at `http://localhost:8000`
API docs at `http://localhost:8000/docs`

### Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Environment variables

```env
NVIDIA_API_KEY=your_nvidia_nim_api_key
DATABASE_URL=postgresql://user:password@host:5432/dbname
ENVIRONMENT=development
```

---

## Project Structure

```
sentris/
├── main.py                    # FastAPI app entry point
├── requirements.txt
├── render.yaml                # Render deployment config
│
├── api/
│   ├── routes/
│   │   ├── connect.py         # /connect, /query, /ask endpoints
│   │   └── anomalies.py       # /anomalies endpoints
│   └── middleware/
│
├── core/
│   ├── connector.py           # DatabaseConnector class
│   ├── nl_to_sql.py           # NLToSQLEngine — Nemotron integration
│   ├── anomaly_detector.py    # AnomalyDetector — Z-score + WoW
│   ├── insight_generator.py   # InsightGenerator — AI explanations
│   └── prompt_templates.py    # Prompt engineering templates
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── components/
│   │       ├── ConnectPanel.jsx
│   │       ├── Dashboard.jsx
│   │       ├── QueryPanel.jsx
│   │       ├── AnomaliesPanel.jsx
│   │       ├── AnomalyCard.jsx
│   │       ├── ChartRenderer.jsx
│   │       ├── ResultsTable.jsx
│   │       └── RevenueTrendChart.jsx
│   └── package.json
│
└── landing/
    └── index.html             # Marketing landing page
```

---

## Deployment

| Service | What's deployed | URL |
|---|---|---|
| Render | FastAPI backend | sentris-api.onrender.com |
| Vercel | React frontend | sentris-sage.vercel.app |
| Vercel | Landing page | sentris-landing.vercel.app |
| Supabase | PostgreSQL database | Managed cloud |

---

## Built by

**Peshal Ghanghas**
Computer Engineering Technology — University of West Alabama

Published IEEE research on Artificial Immune Systems used as the foundation for Sentris's anomaly detection engine.

[LinkedIn](https://linkedin.com/in/peshalghanghas) · [sentris-landing.vercel.app](https://sentris-landing.vercel.app)