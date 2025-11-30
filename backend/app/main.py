from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import os
import logging
from .routers import thoughts, works, auth, uploads, images, analytics


app = FastAPI(title="A-Pujo Backend")

logger = logging.getLogger(__name__)
from fastapi.middleware.cors import CORSMiddleware

# Allow CORS for local frontend during development
# Allow CORS for local frontend during development and any configured origins
allowed = os.getenv("ALLOWED_ORIGINS", "http://localhost:6565").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(thoughts.router)
app.include_router(works.router)
app.include_router(auth.router)
app.include_router(uploads.router)
app.include_router(images.router)
app.include_router(analytics.router)

# Serve backend static files (uploads)
# Allow overriding the static root (useful in shared hosting where project
# files are deployed under a different document root). Set `BACKEND_STATIC_ROOT`
# to the full path of the folder that contains `static/` (for example
# `/home/apujomyi/domains/api.a-pujo.my.id`). If unset, fall back to package-relative path.
APP_ROOT_DIR = os.getenv(
    "BACKEND_STATIC_ROOT",
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..")),
)

static_dir = os.path.join(APP_ROOT_DIR, "static")

if os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.on_event("startup")
def ensure_upload_dirs():
    # Ensure both uploads subdirectories exist for thoughts and works
    try:
        # Use the same static_dir computed above so uploads live under the mounted static path
        base = os.path.abspath(os.path.join(APP_ROOT_DIR, "static", "uploads"))
        thoughts_dir = os.path.join(base, "thoughts")
        works_dir = os.path.join(base, "works")
        analytics_dir = os.path.join(base, "analytics")
        os.makedirs(thoughts_dir, exist_ok=True)
        os.makedirs(works_dir, exist_ok=True)
        os.makedirs(analytics_dir, exist_ok=True)
    except Exception:
        logger.exception("Failed to ensure upload directories")


@app.on_event("startup")
def ensure_admin():
    # Ensure the admin user exists (auth.ensure_admin_user uses bcrypt)
    try:
        auth.ensure_admin_user()
    except Exception:
        # Avoid crashing startup if DB/auth plugin issues exist; log and continue
        logger.exception("Failed to ensure admin user at startup")


@app.get("/health")
def health():
    return {"status": "ok"}
