from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Request, Form
from typing import List, Optional
import json
from .. import schemas
from ..db import get_conn
from .auth import get_current_user
from ..validators import validate_slug, validate_title
import pymysql
import os
import time
import random
from PIL import Image
import io

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

_UPLOADS_BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "analytics"))

os.makedirs(_UPLOADS_BASE, exist_ok=True)


def _save_upload(file: UploadFile):
    filename = file.filename or "upload"
    ext = os.path.splitext(filename)[1].lower()
    safe_name = f"{int(time.time())}-{random.randint(1000,9999)}{ext}"
    out_path = os.path.join(_UPLOADS_BASE, safe_name)
    contents = None
    # If it's an image we can normalize to jpg like other uploads
    if ext in (".jpg", ".jpeg", ".png"):
        contents = file.file.read()
        try:
            img = Image.open(io.BytesIO(contents))
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            max_w = 2000
            if img.width > max_w:
                ratio = max_w / float(img.width)
                new_h = int(float(img.height) * ratio)
                img = img.resize((max_w, new_h), Image.LANCZOS)
            img.save(out_path, format="JPEG", quality=78)
            return safe_name, f"/api/images/analytics/{safe_name}", "image/jpeg"
        except Exception:
            pass
    # otherwise write raw file
    with open(out_path, "wb") as f:
        f.write(file.file.read())
    # guess type from extension
    mime = "application/octet-stream"
    if ext == ".pdf":
        mime = "application/pdf"
    elif ext == ".ipynb":
        mime = "application/json"
    return safe_name, f"/static/uploads/analytics/{safe_name}", mime


@router.get("/", response_model=List[dict])
def list_analytics(skip: int = 0, limit: int = 10):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, excerpt, file_url, file_type, published, published_at, tags, created_at, updated_at FROM analytics ORDER BY created_at DESC LIMIT %s OFFSET %s",
                (limit, skip),
            )
            rows = cur.fetchall()

    for r in rows:
        if r.get("tags") and isinstance(r["tags"], str):
            try:
                r["tags"] = json.loads(r["tags"])
            except Exception:
                r["tags"] = None
        r["published"] = bool(r.get("published"))

    return rows


@router.get("/{slug}")
def get_analytic(slug: str):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, slug, title, excerpt, file_url, file_type, published, published_at, tags, created_at, updated_at FROM analytics WHERE slug = %s LIMIT 1",
                (slug,),
            )
            row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Analytic not found")

    if row.get("tags") and isinstance(row["tags"], str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_analytic(request: Request, current_user: str = Depends(get_current_user)):
    # Parse multipart form-data manually to be resilient to different client Content-Type handling
    form = await request.form()
    try:
        keys = list(form.keys())
        print("DEBUG create_analytic form keys:", keys)
        if "file" in form:
            fobj = form.get("file")
            try:
                print("DEBUG create_analytic uploaded filename:", getattr(fobj, "filename", None))
            except Exception:
                print("DEBUG create_analytic: couldn't read file filename")
    except Exception as e:
        print("DEBUG create_analytic: failed to introspect form", e)

    title = form.get("title")
    slug = form.get("slug")
    excerpt = form.get("excerpt")
    tags = form.get("tags")
    published_raw = form.get("published")
    file = form.get("file")

    if not title:
        raise HTTPException(status_code=422, detail="title is required")
    title = str(title)

    if not slug:
        slug = title.lower().replace(" ", "-")[:200]
    else:
        slug = str(slug)

    validate_slug(slug)
    validate_title(title)

    # coerce published
    pub_flag = False
    if published_raw is not None:
        try:
            pub_flag = str(published_raw).lower() in ("1", "true", "yes", "on")
        except Exception:
            pub_flag = False

    # validate file
    if not file:
        raise HTTPException(status_code=422, detail="file is required")

    # file should be an UploadFile-like
    upload_file = file

    # save file
    fname, url, mime = _save_upload(upload_file)

    # parse tags
    tags_json = None
    if tags:
        try:
            tags_json = json.loads(tags)
        except Exception:
            tags_json = [t.strip() for t in str(tags).split(",") if t.strip()]
            tags_json = json.dumps(tags_json)

    with get_conn() as conn:
        with conn.cursor() as cur:
            try:
                cur.execute(
                    "INSERT INTO analytics (slug, title, excerpt, file_url, file_type, published, tags) VALUES (%s,%s,%s,%s,%s,%s,%s)",
                    (slug, title, excerpt, url, mime, 1 if pub_flag else 0, tags_json),
                )
            except pymysql.err.IntegrityError:
                raise HTTPException(status_code=409, detail="Resource conflict: possibly duplicate slug")

            new_id = cur.lastrowid
            if pub_flag:
                cur.execute("UPDATE analytics SET published_at = NOW() WHERE id = %s", (new_id,))
            cur.execute(
                "SELECT id, slug, title, excerpt, file_url, file_type, published, published_at, tags, created_at, updated_at FROM analytics WHERE id = %s",
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


@router.put("/{slug}")
def update_analytic(
    slug: str,
    title: Optional[str] = Form(None),
    new_slug: Optional[str] = Form(None),
    excerpt: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    published: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: str = Depends(get_current_user),
):
    update_fields = {}
    if new_slug is not None:
        validate_slug(new_slug)
        update_fields["slug"] = new_slug
    if title is not None:
        validate_title(title)
        update_fields["title"] = title
    if excerpt is not None:
        update_fields["excerpt"] = excerpt
    if tags is not None:
        try:
            update_fields["tags"] = json.dumps(json.loads(tags))
        except Exception:
            update_fields["tags"] = json.dumps([t.strip() for t in tags.split(",") if t.strip()])
    if published is not None:
        pub_flag = str(published).lower() in ("1", "true", "yes", "on")
        update_fields["published"] = 1 if pub_flag else 0

    # handle file replacement
    old_file = None
    new_url = None
    new_mime = None
    if file is not None:
        # save new file
        fname, url, mime = _save_upload(file)
        new_url = url
        new_mime = mime
        update_fields["file_url"] = new_url
        update_fields["file_type"] = new_mime

    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    set_clause = ", ".join([f"{k} = %s" for k in update_fields.keys()])
    params = list(update_fields.values())
    params.append(slug)

    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, file_url FROM analytics WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Analytic not found")
            if new_url:
                old_file = existing.get("file_url")

            cur.execute(f"UPDATE analytics SET {set_clause} WHERE slug = %s", tuple(params))
            if old_file and old_file != new_url:
                try:
                    # remove old file from static/uploads/analytics
                    parts = old_file.split("/")
                    fname = parts[-1]
                    p = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "analytics", fname))
                    if os.path.isfile(p):
                        os.remove(p)
                except Exception:
                    pass

            cur.execute("SELECT id, slug, title, excerpt, file_url, file_type, published, published_at, tags, created_at, updated_at FROM analytics WHERE id = %s", (existing["id"],))
            row = cur.fetchone()

    if row.get("tags") and isinstance(row["tags"], str):
        try:
            row["tags"] = json.loads(row["tags"])
        except Exception:
            row["tags"] = None
    row["published"] = bool(row.get("published"))

    return row


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
def delete_analytic(slug: str, current_user: str = Depends(get_current_user)):
    with get_conn() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, file_url FROM analytics WHERE slug = %s LIMIT 1", (slug,))
            existing = cur.fetchone()
            if not existing:
                raise HTTPException(status_code=404, detail="Analytic not found")
            try:
                parts = (existing.get("file_url") or "").split("/")
                fname = parts[-1]
                p = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "static", "uploads", "analytics", fname))
                if os.path.isfile(p):
                    os.remove(p)
            except Exception:
                pass
            cur.execute("DELETE FROM analytics WHERE id = %s", (existing["id"],))

    return None
