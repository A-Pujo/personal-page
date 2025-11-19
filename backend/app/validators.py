import re
from typing import Optional
from fastapi import HTTPException


SLUG_RE = re.compile(r"^[a-z0-9-]{1,200}$")


def validate_slug(slug: str) -> None:
    if not isinstance(slug, str) or not slug:
        raise HTTPException(status_code=422, detail="slug must be a non-empty string")
    if not SLUG_RE.match(slug):
        raise HTTPException(
            status_code=422,
            detail="slug may only contain lowercase letters, numbers and hyphens, max length 200",
        )


def validate_title(title: str) -> None:
    if not isinstance(title, str) or not title.strip():
        raise HTTPException(status_code=422, detail="title must be a non-empty string")
    if len(title) > 300:
        raise HTTPException(status_code=422, detail="title must be 300 characters or fewer")


def validate_content(content: Optional[str]) -> None:
    if content is None:
        return
    if not isinstance(content, str) or not content.strip():
        raise HTTPException(status_code=422, detail="content must be a non-empty string")
