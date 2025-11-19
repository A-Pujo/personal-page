````markdown
# Backend Development Guide — FastAPI + MySQL

This document sketches the backend service for A-Pujo's personal site: a small FastAPI application with a MySQL database to store `thoughts` (blog posts) and `works` (portfolio items).

**Goals**
- Provide API endpoints for Thoughts and Works (CRUD + listing + basic search)
- Use SQLAlchemy (async) for ORM and Alembic for migrations
- MySQL (dev + prod) with connection via `aiomysql` driver
- Keep models simple and extensible (metadata field for extras)

---

## Environment configuration

Suggested environment variables (use `.env` files or secret manager). Two environments are provided below.

- Dev

```
DB_NAME=a_pujo
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=12345678
```

- Prod

```
DB_NAME=apujomyi_portofolio
DB_HOST=localhost
DB_PORT=3306
DB_USER=apujomyi_admin
DB_PASS=alfianacantikku
```

Connection string template (SQLAlchemy async + aiomysql):

```
DATABASE_URL=mysql+aiomysql://<DB_USER>:<DB_PASS>@<DB_HOST>:<DB_PORT>/<DB_NAME>
```

Use Pydantic `BaseSettings` within FastAPI to load vars safely.

---

## Suggested project layout

```
backend/
	app/
		main.py           # FastAPI app + routers
		db.py             # database engine and session (async)
		models.py         # SQLAlchemy ORM models
		schemas.py        # Pydantic request/response models
		crud.py           # DB access helpers
		routers/
			thoughts.py
			works.py
		core/
			config.py       # Pydantic settings
	alembic/            # Alembic migrations
	requirements.txt
	Dockerfile
	README.md
```

Recommended dependencies (pip):

```
fastapi
uvicorn[standard]
sqlalchemy>=1.4
aiomysql
alembic
pydantic
python-dotenv
databases (optional)
```

---

## MySQL DDL (CREATE TABLE)

Notes: use `utf8mb4` charset for emoji support and `JSON` where useful (MySQL 5.7+).

CREATE TABLE for `thoughts`:

```sql
CREATE TABLE `thoughts` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`slug` VARCHAR(200) NOT NULL UNIQUE,
	`title` VARCHAR(300) NOT NULL,
	`excerpt` VARCHAR(500) DEFAULT NULL,
	`content` LONGTEXT NOT NULL,
	`published` TINYINT(1) NOT NULL DEFAULT 0,
	`published_at` DATETIME DEFAULT NULL,
	`tags` JSON DEFAULT NULL,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX (`published`),
	INDEX (`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

CREATE TABLE for `works`:

```sql
CREATE TABLE `works` (
	`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
	`slug` VARCHAR(200) NOT NULL UNIQUE,
	`title` VARCHAR(300) NOT NULL,
	`description` LONGTEXT NOT NULL,
	`year` VARCHAR(20) DEFAULT NULL,
	`url` VARCHAR(1000) DEFAULT NULL,
	`repo` VARCHAR(1000) DEFAULT NULL,
	`images` JSON DEFAULT NULL,
	`tech` JSON DEFAULT NULL,
	`published` TINYINT(1) NOT NULL DEFAULT 0,
	`created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

Notes:
- `slug` is used for friendly URLs (index it and enforce uniqueness)
- `tags`, `images`, `tech` stored as JSON for flexibility
- Add fulltext index on `title`/`content` if you need search functionality: `FULLTEXT(title, content)` (MySQL 5.6+)

---

## SQLAlchemy (async) model examples

Below are simplified SQLAlchemy models using the declarative base and async engine.

app/models.py

```py
from sqlalchemy import Column, Integer, BigInteger, String, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Thought(Base):
		__tablename__ = "thoughts"
		id = Column(BigInteger, primary_key=True, autoincrement=True)
		slug = Column(String(200), nullable=False, unique=True)
		title = Column(String(300), nullable=False)
		excerpt = Column(String(500))
		content = Column(Text, nullable=False)
		published = Column(Boolean, default=False, index=True)
		published_at = Column(DateTime, nullable=True)
		tags = Column(JSON, nullable=True)
		created_at = Column(DateTime, server_default=func.now(), nullable=False)
		updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)

class Work(Base):
		__tablename__ = "works"
		id = Column(BigInteger, primary_key=True, autoincrement=True)
		slug = Column(String(200), nullable=False, unique=True)
		title = Column(String(300), nullable=False)
		description = Column(Text, nullable=False)
		year = Column(String(20))
		url = Column(String(1000))
		repo = Column(String(1000))
		images = Column(JSON, nullable=True)
		tech = Column(JSON, nullable=True)
		published = Column(Boolean, default=False)
		created_at = Column(DateTime, server_default=func.now(), nullable=False)
		updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
```

To use with async SQLAlchemy engine, create the engine with `create_async_engine("mysql+aiomysql://...")` and use `async_sessionmaker`.

---

## Alembic migrations

- Initialize Alembic, update `alembic.ini` to point to your `DATABASE_URL` and set `target_metadata = app.models.Base.metadata` in `env.py`.
- Generate migrations after changes:

```sh
alembic revision --autogenerate -m "create thoughts and works"
alembic upgrade head
```

---

## FastAPI router sketches

Example endpoints (in `app/routers/thoughts.py`):

- GET `/api/thoughts` — list (with pagination, optional published filter)
- GET `/api/thoughts/{slug}` — fetch by slug
- POST `/api/thoughts` — create (protected)
- PUT `/api/thoughts/{id}` — update (protected)
- DELETE `/api/thoughts/{id}` — delete (protected)

Use Pydantic models in `schemas.py` for request/response validation.

---

## Quick start (dev)

1. Create the dev database and user (run in MySQL):

```sql
CREATE DATABASE a_pujo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- optionally create a dedicated user and grant privileges
```

2. Create a virtual environment and install deps:

```sh
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

3. Set env vars (use `.env`) and run migrations:

```sh
# set DB_* env vars or use .env
alembic upgrade head
```

4. Start FastAPI dev server:

```sh
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Notes & recommendations

- Secrets: do not commit production DB credentials. Use a secret manager for production.
- Backups: schedule regular MySQL backups for the production DB.
- Indexing: add indexes for filters/queries you expect (e.g., `published_at`, `slug`, `title`).
- Fulltext search: for richer search, consider a fulltext index or a small search service (Elastic, Typesense).
- Images: store images in object storage (S3) and keep only URLs in the DB `images` JSON.

---

If you'd like, I can scaffold the actual FastAPI files (`app/main.py`, `app/db.py`, `app/models.py`, `app/routers/thoughts.py`, etc.) and an Alembic config next. Tell me which part to scaffold first.
````
