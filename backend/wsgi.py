# Minimal WSGI-compatible export (kept for tools that expect "application" name).
# Note: FastAPI is ASGI-first — prefer running via ASGI servers (uvicorn/gunicorn+uvicorn workers).
from app.main import app as application