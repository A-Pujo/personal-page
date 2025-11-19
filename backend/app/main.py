from fastapi import FastAPI
import os
import logging
from .routers import thoughts, works, auth


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
