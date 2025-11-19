from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class ThoughtBase(BaseModel):
    slug: str
    title: str
    excerpt: Optional[str] = None
    content: str
    tags: Optional[List[str]] = None


class ThoughtCreate(ThoughtBase):
    published: Optional[bool] = False


class ThoughtUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    published: Optional[bool] = None


class ThoughtOut(ThoughtBase):
    id: int
    published: bool
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WorkBase(BaseModel):
    slug: str
    title: str
    description: str
    year: Optional[str] = None
    url: Optional[str] = None
    repo: Optional[str] = None
    tech: Optional[List[str]] = None
    images: Optional[List[str]] = None


class WorkCreate(WorkBase):
    published: Optional[bool] = False


class WorkUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    year: Optional[str] = None
    url: Optional[str] = None
    repo: Optional[str] = None
    tech: Optional[List[str]] = None
    images: Optional[List[str]] = None
    published: Optional[bool] = None


class WorkOut(WorkBase):
    id: int
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
