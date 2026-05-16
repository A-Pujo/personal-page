import sys
import os

# Ensure the backend directory is on the path so `app` package is importable
sys.path.insert(0, os.path.dirname(__file__))

# a2wsgi bridges ASGI (FastAPI) → WSGI (Passenger)
from a2wsgi import ASGIMiddleware
from app.main import app

application = ASGIMiddleware(app)
