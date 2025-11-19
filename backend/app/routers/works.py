from fastapi import APIRouter, HTTPException, status
from typing import List
import json
from .. import schemas
from ..db import get_conn
from ..validators import validate_slug, validate_title
from .auth import get_current_user
from fastapi import Depends
import pymysql

router = APIRouter(prefix="/api/works", tags=["works"])


@router.get("/", response_model=List[schemas.WorkOut])
def list_works(skip: int = 0, limit: int = 10):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, description, year, url, repo, images, tech, published, created_at, updated_at FROM works ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, skip),
            )
            rows = cur.fetchall()

    for r in rows:
        if r.get("tech") and isinstance(r["tech"], str):
            try:
                r["tech"] = json.loads(r["tech"])
            except Exception:
                r["tech"] = None
        if r.get("images") and isinstance(r["images"], str):
            try:
                r["images"] = json.loads(r["images"])
            except Exception:
                r["images"] = None
        r["published"] = bool(r.get("published"))

    return rows


@router.get("/{slug}", response_model=schemas.WorkOut)
def get_work(slug: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, description, year, url, repo, images, tech, published, created_at, updated_at FROM works WHERE slug = %s LIMIT 1",
                (slug,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Work not found")

    if row.get("tech") and isinstance(row["tech"], str):
        try:
            row["tech"] = json.loads(row["tech"])
        except Exception:
            row["tech"] = None
    if row.get("images") and isinstance(row["images"], str):
        try:
            row["images"] = json.loads(row["images"])
        except Exception:
            row["images"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.post("/", response_model=schemas.WorkOut, status_code=status.HTTP_201_CREATED)
def create_work(payload: schemas.WorkCreate, current_user: str = Depends(get_current_user)):
    validate_slug(payload.slug)
    validate_title(payload.title)

    tech_json = json.dumps(payload.tech) if payload.tech is not None else None
    images_json = json.dumps(payload.images) if payload.images is not None else None

    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    "INSERT INTO works (slug, title, description, year, url, repo, images, tech, published) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
                    (
                        payload.slug,
                        payload.title,
                        payload.description,
                        payload.year,
                        payload.url,
                        payload.repo,
                        images_json,
                        tech_json,
                        1 if payload.published else 0,
                    ),
                )
            except pymysql.err.IntegrityError:
                raise HTTPException(status_code=409, detail="Resource conflict: possibly duplicate slug")

            new_id = cur.lastrowid
            cur.execute(
                "SELECT id, slug, title, description, year, url, repo, images, tech, published, created_at, updated_at FROM works WHERE id = %s",
                (new_id,),
            )
            row = cur.fetchone()

    if row.get("tech") and isinstance(row["tech"], str):
        try:
            row["tech"] = json.loads(row["tech"])
        except Exception:
            row["tech"] = None
    if row.get("images") and isinstance(row["images"], str):
        try:
            row["images"] = json.loads(row["images"])
        except Exception:
            row["images"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.put("/{slug}", response_model=schemas.WorkOut)
def update_work(slug: str, payload: schemas.WorkUpdate, current_user: str = Depends(get_current_user)):
    update_fields = {}
    if payload.slug is not None:
        update_fields["slug"] = payload.slug
    if payload.title is not None:
        update_fields["title"] = payload.title
    if payload.description is not None:
        update_fields["description"] = payload.description
    if payload.year is not None:
        update_fields["year"] = payload.year
    if payload.url is not None:
        update_fields["url"] = payload.url
    if payload.repo is not None:
        update_fields["repo"] = payload.repo
    if payload.tech is not None:
        update_fields["tech"] = json.dumps(payload.tech)
    if payload.images is not None:
        update_fields["images"] = json.dumps(payload.images)
    if payload.published is not None:
        update_fields["published"] = 1 if payload.published else 0

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join([f"{k} = %s" for k in update_fields.keys()])
    params = list(update_fields.values())
    params.append(slug)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM works WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Work not found")

            cur.execute(f"UPDATE works SET {set_clause} WHERE slug = %s", tuple(params))
            cur.execute(
                "SELECT id, slug, title, description, year, url, repo, images, tech, published, created_at, updated_at FROM works WHERE id = %s",
                (existing["id"],),
            )
            row = cur.fetchone()

    if row.get("tech") and isinstance(row["tech"], str):
        try:
            row["tech"] = json.loads(row["tech"])
        except Exception:
            row["tech"] = None
    if row.get("images") and isinstance(row["images"], str):
        try:
            row["images"] = json.loads(row["images"])
        except Exception:
            row["images"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_work(slug: str, current_user: str = Depends(get_current_user)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id FROM works WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Work not found")
            cur.execute("DELETE FROM works WHERE id = %s", (existing["id"],))

    return None
