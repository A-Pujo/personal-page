from fastapi import APIRouter, HTTPException, status
from datetime import datetime
import re
from typing import List
import json
import html
from .. import schemas
from ..db import get_conn
from .auth import get_current_user
from fastapi import Depends
from ..validators import validate_slug, validate_title, validate_content
import pymysql
import os

_UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "thoughts"))


def _delete_uploaded_file_from_path(path: str):
    if not path:
        return
    # path is expected to be like /api/images/<category>/<filename>
    try:
        parts = path.split("/")
        # parts: ['', 'api', 'images', '<category>', '<filename>']
        if len(parts) >= 5:
            category = parts[3]
            fname = parts[4]
        else:
            # fallback to basename and default category
            category = "thoughts"
            fname = os.path.basename(path)
        p = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", category, fname))
        if os.path.isfile(p):
            os.remove(p)
    except Exception:
        pass

router = APIRouter(prefix="/api/thoughts", tags=["thoughts"])


def _slugify_title(title: str) -> str:
    # basic slugify: lowercase, replace non-alnum with hyphens, collapse, trim
    s = title.lower()
    # replace non alnum with hyphen
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-")
    # truncate to 50 chars for the title part
    if len(s) > 50:
        s = s[:50].rstrip("-")
    return s


@router.get("/", response_model=List[schemas.ThoughtOut])
def list_thoughts(skip: int = 0, limit: int = 10):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, excerpt, featured_img, content, published, published_at, tags, created_at, updated_at FROM thoughts ORDER BY created_at DESC LIMIT %s OFFSET %s",
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
                "SELECT id, slug, title, excerpt, featured_img, content, published, published_at, tags, created_at, updated_at FROM thoughts WHERE slug = %s LIMIT 1",
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
    # If client didn't provide a slug, generate one from the title + date YYYYMMDD
    if not getattr(payload, "slug", None):
        title_part = _slugify_title(payload.title or "")
        date_part = datetime.utcnow().strftime("%Y%m%d")
        generated = f"{title_part}-{date_part}" if title_part else date_part
        payload.slug = generated
    validate_slug(payload.slug)
    validate_title(payload.title)
    validate_content(payload.content)

    encoded_content = html.escape(payload.content)
    tags_json = json.dumps(payload.tags) if payload.tags is not None else None
    featured = getattr(payload, "featured_img", None)

    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    "INSERT INTO thoughts (slug, title, excerpt, featured_img, content, published, published_at, tags) VALUES (%s,%s,%s,%s,%s,%s,%s,%s)",
                        (
                            payload.slug,
                            payload.title,
                            payload.excerpt,
                            featured,
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
                "SELECT id, slug, title, excerpt, featured_img, content, published, published_at, tags, created_at, updated_at FROM thoughts WHERE id = %s",
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
    if hasattr(payload, "featured_img") and payload.featured_img is not None:
        update_fields["featured_img"] = payload.featured_img
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
            # if featured_img is included in update, fetch old value first so we can delete the old file
            old_featured = None
            if "featured_img" in update_fields:
                cur.execute("SELECT featured_img FROM thoughts WHERE slug = %s LIMIT 1", (slug,))
                tmp = cur.fetchone()
                old_featured = tmp.get("featured_img") if tmp else None

            cur.execute(f"UPDATE thoughts SET {set_clause} WHERE slug = %s", tuple(params))
            # delete old featured image if replaced
            if "featured_img" in update_fields and old_featured and old_featured != update_fields["featured_img"]:
                _delete_uploaded_file_from_path(old_featured)

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
            cur.execute("SELECT id, featured_img FROM thoughts WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Thought not found")
            # delete featured image file if present
            try:
                fimg = existing.get("featured_img")
                if fimg:
                    _delete_uploaded_file_from_path(fimg)
            except Exception:
                pass
            cur.execute("DELETE FROM thoughts WHERE id = %s", (existing["id"],))

    return None
