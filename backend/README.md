# Backend — A-Pujo personal page

Quick scaffold for the backend service (FastAPI + MySQL using `pymysql`).

Quick start (development):

```sh
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# copy .env.example to .env.dev and edit if needed
cp .env.example .env.dev

# create database and run the SQL schema (or use alembic)
# mysql -u root -p < sql/schema.sql

python -m uvicorn app.main:app --reload --port 6363
```

Notes:

- This scaffold uses synchronous SQLAlchemy with `pymysql`. For high-concurrency sites consider async drivers (aiomysql) and async engines.
- Do NOT check in production credentials. Use a secret manager for prod.
