from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
import os
import jwt
from datetime import datetime, timedelta
from ..db import get_conn
from passlib.context import CryptContext

# Use a safe default hasher that doesn't depend on the native bcrypt backend
# which can be missing or behave inconsistently in some environments.
# pbkdf2_sha256 has no 72-byte password limit like bcrypt.
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshIn(BaseModel):
    refresh_token: str


class LogoutIn(BaseModel):
    refresh_token: str | None = None


SECRET = os.getenv("SECRET_KEY", "dev-secret")
EXP_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, username, password FROM users WHERE username = %s LIMIT 1", (payload.username,))
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    stored = row.get("password")
    try:
        verified = pwd_context.verify(payload.password, stored)
    except Exception:
        verified = False

    if not verified:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    now = datetime.utcnow()
    access_payload = {"sub": row["username"], "iat": now, "exp": now + timedelta(minutes=EXP_MINUTES)}
    access_token = jwt.encode(access_payload, SECRET, algorithm="HS256")

    refresh_exp_minutes = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
    refresh_payload = {"sub": row["username"], "iat": now, "exp": now + timedelta(minutes=refresh_exp_minutes)}
    refresh_token = jwt.encode(refresh_payload, SECRET, algorithm="HS256")

    # store refresh token in DB for rotation
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE users SET refresh_token = %s WHERE id = %s", (refresh_token, row["id"]))

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


def verify_token(token: str):
    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        return data.get("sub")
    except jwt.PyJWTError:
        return None


def get_current_user(authorization: str = Header(None)):
    # Expect Authorization: Bearer <token>
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid auth header")
    user = verify_token(parts[1])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return user


@router.post("/refresh", response_model=TokenOut)
def refresh_tokens(payload: RefreshIn):
    token = payload.refresh_token
    try:
        data = jwt.decode(token, SECRET, algorithms=["HS256"])
        username = data.get("sub")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, username, refresh_token FROM users WHERE username = %s LIMIT 1", (username,))
            row = cur.fetchone()

    if not row or not row.get("refresh_token"):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if row.get("refresh_token") != token:
        raise HTTPException(status_code=401, detail="Invalid or rotated refresh token")

    now = datetime.utcnow()
    access_payload = {"sub": username, "iat": now, "exp": now + timedelta(minutes=EXP_MINUTES)}
    access_token = jwt.encode(access_payload, SECRET, algorithm="HS256")

    refresh_exp_minutes = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7)))
    refresh_payload = {"sub": username, "iat": now, "exp": now + timedelta(minutes=refresh_exp_minutes)}
    new_refresh_token = jwt.encode(refresh_payload, SECRET, algorithm="HS256")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE users SET refresh_token = %s WHERE id = %s", (new_refresh_token, row["id"]))

    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}


@router.post("/logout")
def logout(payload: LogoutIn | None = None, authorization: str = Header(None)):
    username = None
    if authorization:
        parts = authorization.split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            try:
                data = jwt.decode(parts[1], SECRET, algorithms=["HS256"])
                username = data.get("sub")
            except Exception:
                username = None

    if not username and payload and payload.refresh_token:
        try:
            data = jwt.decode(payload.refresh_token, SECRET, algorithms=["HS256"])
            username = data.get("sub")
        except Exception:
            username = None

    if not username:
        raise HTTPException(status_code=400, detail="No token provided")

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE users SET refresh_token = NULL WHERE username = %s", (username,))

    return {"ok": True}


def ensure_admin_user(username: str = "pujo", password: str = "alfiSS@H"):
    # Ensure admin user exists with hashed password
    # Ensure password is a str and not ridiculously long; pbkdf2_sha256 can handle long inputs,
    # but coerce to str and trim any accidental surrounding whitespace.
    if not isinstance(password, str):
        password = str(password)
    password = password.strip()
    hashed = pwd_context.hash(password)
    with get_conn() as conn:
        with conn.cursor() as cur:
            # Insert the admin user if it doesn't exist. If it exists, do not overwrite the password.
            cur.execute(
                "INSERT INTO users (username, password) VALUES (%s, %s) ON DUPLICATE KEY UPDATE username = username",
                (username, hashed),
            )
