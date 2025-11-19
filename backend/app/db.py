import os
import json
from contextlib import contextmanager
import pymysql
from dotenv import load_dotenv

# Load env from repo backend/.env.dev by default
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.dev"))

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME")


@contextmanager
def get_conn():
    conn = pymysql.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME,
        port=DB_PORT,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
    )
    try:
        yield conn
    finally:
        try:
            conn.close()
        except Exception:
            pass
