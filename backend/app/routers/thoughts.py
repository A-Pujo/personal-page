from fastapi import APIRouter, HTTPException, status
from typing import List
import json
import html
from .. import schemas
from ..db import get_conn
from .auth import get_current_user
from fastapi import Depends
from ..validators import validate_slug, validate_title, validate_content
import pymysql

router = APIRouter(prefix="/api/thoughts", tags=["thoughts"])


@router.get("/", response_model=List[schemas.ThoughtOut])
def list_thoughts(skip: int = 0, limit: int = 10):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, excerpt, content, published, published_at, tags, created_at, updated_at FROM thoughts ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, skip),
            )
            rows = cur.fetchall()

    # normalize rows
    for r in rows:
        if r.get("tags") and isinstance(r["tags"], str):
            try:
                r["tags"] = json.loads(r["tags"])
            except Exception:
                r["tags"] = None
        r["published"] = bool(r.get("published"))

    return rows


@router.get("/{slug}", response_model=schemas.ThoughtOut)
def get_thought(slug: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, excerpt, content, published, published_at, tags, created_at, updated_at FROM thoughts WHERE slug = %s LIMIT 1",
                (slug,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Thought not found")

    if row.get("tags") and isinstance(row["tags"], str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.post("/", response_model=schemas.ThoughtOut, status_code=status.HTTP_201_CREATED)
def create_thought(payload: schemas.ThoughtCreate, current_user: str = Depends(get_current_user)):
    # HTML-encode content before storing
    validate_slug(payload.slug)
    validate_title(payload.title)
    validate_content(payload.content)

    encoded_content = html.escape(payload.content)
    tags_json = json.dumps(payload.tags) if payload.tags is not None else None

    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    "INSERT INTO thoughts (slug, title, excerpt, content, published, published_at, tags) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (
                        payload.slug,
                        payload.title,
                        payload.excerpt,
                        encoded_content,
                        1 if payload.published else 0,
                        None,
                        tags_json,
                    ),
                )
            except pymysql.err.IntegrityError as ie:
                # likely duplicate slug or constraint violation
                raise HTTPException(status_code=409, detail="Resource conflict: possibly duplicate slug")

            new_id = cur.lastrowid
            if payload.published:
                cur.execute("UPDATE thoughts SET published_at = NOW() WHERE id = %s", (new_id,))
            cur.execute(
                "SELECT id, slug, title, excerpt, content, published, published_at, tags, created_at, updated_at FROM thoughts WHERE id = %s",
                (new_id,),
            )
            row = cur.fetchone()

    if row.get("tags") and isinstance(row["tags"], str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.put("/{slug}", response_model=schemas.ThoughtOut)
def update_thought(slug: str, payload: schemas.ThoughtCreate | schemas.ThoughtUpdate, current_user: str = Depends(get_current_user)):
    # Accept either full create model or partial update model
    update_fields = {}
    if hasattr(payload, "slug") and payload.slug is not None:
        validate_slug(payload.slug)
        update_fields["slug"] = payload.slug
    if hasattr(payload, "title") and payload.title is not None:
        validate_title(payload.title)
        update_fields["title"] = payload.title
    if hasattr(payload, "excerpt") and payload.excerpt is not None:
        update_fields["excerpt"] = payload.excerpt
    if hasattr(payload, "content") and payload.content is not None:
        validate_content(payload.content)
        update_fields["content"] = html.escape(payload.content)
    if hasattr(payload, "tags") and payload.tags is not None:
        update_fields["tags"] = json.dumps(payload.tags)
    if hasattr(payload, "published") and payload.published is not None:
        update_fields["published"] = 1 if payload.published else 0

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join([f"{k} = %s" for k in update_fields.keys()])
    params = list(update_fields.values())
    params.append(slug)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM thoughts WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Thought not found")

            cur.execute(f"UPDATE thoughts SET {set_clause} WHERE slug = %s", tuple(params))
            # Handle published_at if published flag present
            if "published" in update_fields:
                if update_fields["published"]:
                    cur.execute("UPDATE thoughts SET published_at = NOW() WHERE id = %s", (existing["id"],))
                else:
                    cur.execute("UPDATE thoughts SET published_at = NULL WHERE id = %s", (existing["id"],))

            cur.execute(
                "SELECT id, slug, title, excerpt, content, published, published_at, tags, created_at, updated_at FROM thoughts WHERE id = %s",
                (existing["id"],),
            )
            row = cur.fetchone()

    if row.get("tags") and isinstance(row["tags"], str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_thought(slug: str, current_user: str = Depends(get_current_user)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM thoughts WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Thought not found")
            cur.execute("DELETE FROM thoughts WHERE id = %s", (existing["id"],))

    return None
