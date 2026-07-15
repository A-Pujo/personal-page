# Quick Start Guide

Get up and running with the AI Study Platform in 5 minutes!

## Prerequisites Check

Make sure you have:

- ✅ Python 3.9+
- ✅ Node.js 18+
- ✅ PostgreSQL 14+
- ✅ LM Studio running at http://127.0.0.1:1234

## Automated Setup

Run the setup script:

```bash
./setup.sh
```

This will:

1. Create Python virtual environment
2. Install all dependencies
3. Set up the database
4. Create configuration files

## Manual Setup (if needed)

### 1. Database

```bash
# Connect to PostgreSQL
psql -U postgres
# Password: 123456

# Create database and schema
CREATE DATABASE alnpj;
\c alnpj
CREATE SCHEMA knowledge;
\q

# Run schema
PGPASSWORD=123456 psql -U postgres -d alnpj < database/schema.sql
```

### 2. Python Backend

```bash
cd python
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env file
```

### 3. Frontend

```bash
cd frontend
pnpm install
```

## Running the Application

### Terminal 1: Backend

```bash
cd python
source venv/bin/activate
python main.py
```

Backend runs on http://localhost:8000

### Terminal 2: Frontend

```bash
cd frontend
pnpm dev
```

Frontend runs on http://localhost:3000

## First Steps

1. **Open http://localhost:3000**
2. **Upload a PDF**:
   - Go to Library
   - Click "Upload PDF Document"
   - Select a PDF file
   - Wait for processing (1-3 minutes)

3. **Explore Features**:
   - View document summaries
   - Try the AI Tutor
   - Practice with exercises
   - Study with flashcards

## Verify LM Studio

Test the LM Studio connection:

```bash
curl http://127.0.0.1:1234/v1/models
```

Should return a list of loaded models.

## Troubleshooting

### "Database connection failed"

- Check if PostgreSQL is running: `brew services list`
- Verify connection string in `.env`

### "LM Studio not responding"

- Open LM Studio
- Load a model (e.g., Qwen2.5-8B-Instruct)
- Start the local server (default port 1234)

### "Module not found" errors

- Activate virtual environment: `source python/venv/bin/activate`
- Reinstall dependencies: `pip install -r requirements.txt`

### Frontend won't start

- Delete `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
- Check if port 3000 is available

## Quick Test

Upload a small PDF and check:

- ✅ Document appears in Library
- ✅ Status changes from "Uploaded" → "Processing" → "Ready"
- ✅ Click document to view details
- ✅ AI Tutor responds to questions

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore [TECHNICAL_WORKFLOW.md](docs/TECHNICAL_WORKFLOW.md) for architecture details
- Customize settings in `.env`

## Getting Help

- Check logs in terminal output
- Review [Troubleshooting](#troubleshooting) section
- Open an issue on GitHub

Happy learning! 📚✨
