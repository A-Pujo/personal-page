# AI Study Platform

A local AI-powered study platform that transforms PDFs into interactive learning experiences with concept extraction, summaries, exercises, flashcards, and an AI tutor.

## Features

- 📚 **Document Processing**: Upload PDFs and automatically extract text, images, and structure
- 🧠 **Knowledge Extraction**: Identify concepts, definitions, equations, and relationships
- 📝 **Smart Summaries**: Generate quick, detailed, and academic summaries
- ❓ **Exercise Generation**: Auto-create questions with multiple difficulty levels
- 🎴 **Flashcards**: Generate flashcards from extracted concepts
- 🤖 **AI Tutor**: Ask questions and get contextual answers from your documents
- 🔍 **Semantic Search**: Find relevant content using vector embeddings
- 📊 **Progress Tracking**: Monitor your learning progress

## Architecture

```
Frontend (React + Vite)
    ↓
Python API (FastAPI)
    ↓
┌──────────┬──────────────┐
│          │              │
AI Engine  PostgreSQL    LM Studio
(Python)   (pgvector)    (Local LLM)
```

## Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+ with pgvector
- LM Studio running locally (or compatible OpenAI API endpoint)

## Installation

### 1. Clone Repository

```bash
cd /Users/djpb/Documents/Pujo/Project/personal-page/pujo-knowledge
```

### 2. Database Setup

```bash
# Install PostgreSQL and pgvector (macOS)
brew install postgresql@14 pgvector
brew services start postgresql@14

# Create database
createdb knowledge_platform

# Run schema
psql knowledge_platform < database/schema.sql
```

### 3. Python Backend Setup

```bash
cd python

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env with your configuration
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
pnpm install
# or
npm install
```

### 5. LM Studio Setup

1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download a model (recommended: Qwen2.5-8B-Instruct)
3. Start the local server on port 1234
4. Verify it's running at http://127.0.0.1:1234

## Running the Application

### Start Python Backend

```bash
cd python
source venv/bin/activate
python main.py
```

The API will be available at http://localhost:8000

### Start Frontend

```bash
cd frontend
pnpm dev
# or
npm run dev
```

The frontend will be available at http://localhost:3000

## Usage

### Upload a Document

1. Navigate to the Library page
2. Click "Upload PDF Document" or drag & drop a PDF
3. Wait for processing to complete

### View Document

1. Click on any document in the Library
2. View sections, summaries, and quick actions

### AI Tutor

1. Navigate to AI Tutor page
2. Optionally select a specific document
3. Ask questions about your materials

### Practice Exercises

1. Go to Exercises from a document page
2. Answer questions
3. Get instant feedback

### Study with Flashcards

1. Access Flashcards from a document
2. Click to flip cards
3. Navigate through your deck

## API Endpoints

### Documents

- `POST /api/documents/upload` - Upload PDF
- `GET /api/documents` - List all documents
- `GET /api/documents/{id}` - Get document details
- `GET /api/documents/{id}/sections` - Get sections
- `GET /api/documents/{id}/summaries` - Get summaries

### Search

- `POST /api/search` - Semantic search

### Tutor

- `POST /api/tutor/ask` - Ask AI tutor a question

### Exercises

- `GET /api/documents/{id}/questions` - Get questions
- `POST /api/questions/{id}/answer` - Submit answer

### Flashcards

- `GET /api/documents/{id}/flashcards` - Get flashcards

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `DATABASE_URL`: PostgreSQL connection string
- `LM_STUDIO_URL`: LM Studio API endpoint
- `EMBEDDING_MODEL`: Hugging Face model for embeddings
- `CHUNK_SIZE`: Text chunk size for processing
- `MAX_TOKENS`: Maximum tokens for LLM responses

### Recommended Models

**LLM (via LM Studio)**:

- Qwen2.5-8B-Instruct (Q4_K_M)
- Mistral-7B-Instruct
- Llama-3-8B-Instruct

**Embedding Model**:

- BAAI/bge-m3 (default, multilingual)
- nomic-embed-text-v1
- all-MiniLM-L6-v2 (faster, smaller)

## Project Structure

```
pujo-knowledge/
├── python/                 # Python AI Engine
│   ├── main.py            # FastAPI server
│   ├── config.py          # Configuration
│   ├── database.py        # Database utilities
│   ├── processor.py       # Document processor
│   ├── parser/            # PDF parsing
│   ├── extractor/         # Knowledge extraction
│   ├── embedding/         # Embedding service
│   ├── llm/               # LLM client
│   └── requirements.txt   # Python dependencies
├── frontend/              # React Frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable components
│   │   └── services/      # API services
│   └── package.json       # Node dependencies
├── database/              # Database schema
│   ├── schema.sql         # PostgreSQL schema
│   └── README.md          # Database setup
├── storage/               # File storage
│   ├── pdf/               # Uploaded PDFs
│   ├── images/            # Extracted images
│   └── embeddings/        # Cached embeddings
└── docs/                  # Documentation
```

## Development

### Adding New Features

1. **Backend**: Add routes in `python/main.py`
2. **Processing**: Extend `python/processor.py`
3. **Frontend**: Add pages in `frontend/src/pages/`
4. **Database**: Update `database/schema.sql`

### Running Tests

```bash
# Backend tests (to be added)
cd python
pytest

# Frontend tests (to be added)
cd frontend
pnpm test
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running: `brew services list`
- Check connection string in `.env`
- Verify database exists: `psql -l`

### LM Studio Not Connecting

- Ensure LM Studio server is running
- Check endpoint: http://127.0.0.1:1234/v1/models
- Verify firewall settings

### Embedding Model Download

- First run will download the model (~500MB-2GB)
- Ensure internet connection
- Check disk space

### Processing Takes Too Long

- Reduce `CHUNK_SIZE` in `.env`
- Use smaller embedding model
- Limit number of questions/flashcards generated

## Performance Tips

1. **Use GPU**: If available, configure PyTorch to use GPU
2. **Batch Processing**: Process multiple documents simultaneously
3. **Cache Embeddings**: Enable embedding cache in config
4. **Optimize Database**: Add indexes for frequently queried fields

## Future Enhancements

- [ ] Support for DOCX, EPUB formats
- [ ] Cross-document concept linking
- [ ] Spaced repetition for flashcards
- [ ] Export to Anki
- [ ] Study analytics dashboard
- [ ] Mobile app
- [ ] Collaborative features
- [ ] Custom exercise templates

## License

MIT

## Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## Support

For issues and questions, please create a GitHub issue.

## Acknowledgments

- Built with React, FastAPI, PostgreSQL, and LM Studio
- Embedding models from Hugging Face
- PDF processing with PyMuPDF and Docling
