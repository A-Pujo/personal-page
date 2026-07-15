# Database Setup

## Prerequisites

- PostgreSQL 14+
- pgvector extension

## Installation

### 1. Install PostgreSQL (macOS)

```bash
brew install postgresql@14
brew services start postgresql@14
```

### 2. Install pgvector

```bash
brew install pgvector
```

### 3. Create Database

```bash
psql -U postgres
# Enter password: 123456

# Create database
CREATE DATABASE alnpj;

# Connect to database
\c alnpj

# Create schema
CREATE SCHEMA knowledge;
```

### 4. Run Schema

```bash
psql -U postgres -d alnpj < schema.sql
```

## Connection String

```
postgresql://postgres:123456@localhost:5432/alnpj
```

## Schema

All tables are created in the `knowledge` schema.

## Environment Variables

Add to your `.env` file:

```
DATABASE_URL=postgresql://postgres:123456@localhost:5432/alnpj
DATABASE_SCHEMA=knowledge
```
