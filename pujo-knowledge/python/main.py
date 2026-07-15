"""
FastAPI Server for AI Study Platform
"""
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import shutil
from pathlib import Path
import logging

from config import settings
from database import db, init_db
from processor import document_processor
from embedding.service import embedding_service
from llm.client import llm_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(title="AI Study Platform API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class QuestionRequest(BaseModel):
    question: str
    document_id: Optional[int] = None
    chat_history: Optional[List[Dict[str, str]]] = None


class SearchRequest(BaseModel):
    query: str
    document_id: Optional[int] = None
    limit: int = 10


class ConceptCreate(BaseModel):
    name: str
    definition: str
    concept_type: str = "general"


# Startup/shutdown events
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting AI Study Platform API")
    init_db()
    embedding_service.load_model()
    logger.info("Services initialized")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down AI Study Platform API")
    db.close()


# Health check
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "AI Study Platform API"}


@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "embedding_service": "loaded",
        "llm_service": settings.deepseek_url
    }


# Document endpoints
@app.post("/api/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    """Upload and process a PDF document"""
    
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    # Save file
    file_path = settings.pdf_path / file.filename
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"File saved: {file_path}")
        
        # Process document in background
        background_tasks.add_task(
            document_processor.process_document,
            str(file_path)
        )
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "status": "processing"
        }
    
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/documents")
async def list_documents():
    """List all documents"""
    query = """
        SELECT id, title, filename, upload_date, status, field, subject_area, document_type, total_pages
        FROM documents
        ORDER BY upload_date DESC
    """
    
    documents = db.execute_query(query)
    return {"documents": documents}


@app.get("/api/documents/{document_id}")
async def get_document(document_id: int):
    """Get document details"""
    query = """
        SELECT *
        FROM documents
        WHERE id = %s
    """
    
    result = db.execute_query(query, (document_id,))
    
    if not result:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return result[0]


@app.get("/api/documents/{document_id}/file")
async def get_document_file(document_id: int):
    """Serve the original PDF file for a document"""
    query = "SELECT filename, file_path FROM documents WHERE id = %s"
    result = db.execute_query(query, (document_id,))

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(result[0]["file_path"])

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Document file not found on disk")

    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=result[0]["filename"],
    )


@app.delete("/api/documents/{document_id}")
async def delete_document(document_id: int):
    """Delete a document, its DB records (cascaded), and its stored file"""
    query = "SELECT file_path FROM documents WHERE id = %s"
    result = db.execute_query(query, (document_id,))

    if not result:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = Path(result[0]["file_path"])

    # Deleting the document row cascades to sections, chunks, embeddings,
    # concept occurrences, summaries, questions, flashcards, etc. Concepts
    # themselves are shared across documents (no document_id FK), so they
    # only get removed here once no other document references them anymore.
    db.execute_update("DELETE FROM documents WHERE id = %s", (document_id,))
    db.execute_update("""
        DELETE FROM concepts c
        WHERE NOT EXISTS (
            SELECT 1 FROM concept_occurrences co WHERE co.concept_id = c.id
        )
    """)

    if file_path.exists():
        try:
            file_path.unlink()
        except OSError as e:
            logger.error(f"Failed to delete file {file_path}: {e}")

    return {"message": "Document deleted successfully", "document_id": document_id}


@app.get("/api/documents/{document_id}/sections")
async def get_document_sections(document_id: int):
    """Get document sections"""
    query = """
        SELECT id, section_type, title, page_start, order_index
        FROM document_sections
        WHERE document_id = %s
        ORDER BY order_index
    """
    
    sections = db.execute_query(query, (document_id,))
    return {"sections": sections}


@app.get("/api/documents/{document_id}/summaries")
async def get_document_summaries(document_id: int, summary_type: Optional[str] = None):
    """Get document summaries"""
    if summary_type:
        query = """
            SELECT s.*, ds.title as section_title
            FROM summaries s
            LEFT JOIN document_sections ds ON s.section_id = ds.id
            WHERE s.document_id = %s AND s.summary_type = %s
        """
        summaries = db.execute_query(query, (document_id, summary_type))
    else:
        query = """
            SELECT s.*, ds.title as section_title
            FROM summaries s
            LEFT JOIN document_sections ds ON s.section_id = ds.id
            WHERE s.document_id = %s
        """
        summaries = db.execute_query(query, (document_id,))
    
    return {"summaries": summaries}


# Search endpoints
@app.post("/api/search")
async def semantic_search(request: SearchRequest):
    """Semantic search across documents"""
    
    # Generate query embedding
    query_embedding = embedding_service.encode_single(request.query)
    
    # Search
    results = db.search_embeddings(
        query_embedding,
        limit=request.limit,
        document_id=request.document_id
    )
    
    return {"results": results}


# Concepts endpoints
@app.get("/api/concepts")
async def list_concepts(document_id: Optional[int] = None):
    """List concepts"""
    if document_id:
        query = """
            SELECT DISTINCT c.*
            FROM concepts c
            JOIN concept_occurrences co ON c.id = co.concept_id
            WHERE co.document_id = %s
        """
        concepts = db.execute_query(query, (document_id,))
    else:
        query = "SELECT * FROM concepts LIMIT 100"
        concepts = db.execute_query(query)
    
    return {"concepts": concepts}


@app.get("/api/concepts/{concept_id}")
async def get_concept(concept_id: int):
    """Get concept details"""
    query = "SELECT * FROM concepts WHERE id = %s"
    result = db.execute_query(query, (concept_id,))
    
    if not result:
        raise HTTPException(status_code=404, detail="Concept not found")
    
    # Get related concepts
    relationships_query = """
        SELECT c.*, r.relationship_type, r.strength
        FROM relationships r
        JOIN concepts c ON r.target_concept_id = c.id
        WHERE r.source_concept_id = %s
    """
    
    related = db.execute_query(relationships_query, (concept_id,))
    
    return {
        "concept": result[0],
        "related_concepts": related
    }


# Questions/Exercises endpoints
@app.get("/api/documents/{document_id}/questions")
async def get_questions(document_id: int, difficulty: Optional[str] = None):
    """Get questions for a document"""
    if difficulty:
        query = """
            SELECT * FROM questions
            WHERE document_id = %s AND difficulty = %s
        """
        questions = db.execute_query(query, (document_id, difficulty))
    else:
        query = "SELECT * FROM questions WHERE document_id = %s"
        questions = db.execute_query(query, (document_id,))
    
    return {"questions": questions}


@app.post("/api/questions/{question_id}/answer")
async def submit_answer(question_id: int, answer: Dict):
    """Submit an answer to a question"""
    user_answer = answer.get("answer")
    
    # Get correct answer
    query = "SELECT correct_answer FROM questions WHERE id = %s"
    result = db.execute_query(query, (question_id,))
    
    if not result:
        raise HTTPException(status_code=404, detail="Question not found")
    
    correct_answer = result[0]['correct_answer']
    is_correct = user_answer.strip().lower() == correct_answer.strip().lower()
    
    # Store answer
    insert_query = """
        INSERT INTO answers (question_id, user_answer, is_correct)
        VALUES (%s, %s, %s)
        RETURNING id
    """
    
    answer_id = db.execute_insert(insert_query, (question_id, user_answer, is_correct))
    
    return {
        "answer_id": answer_id,
        "is_correct": is_correct,
        "correct_answer": correct_answer if not is_correct else None
    }


# Flashcards endpoints
@app.get("/api/documents/{document_id}/flashcards")
async def get_flashcards(document_id: int):
    """Get flashcards for a document"""
    query = "SELECT * FROM flashcards WHERE document_id = %s"
    flashcards = db.execute_query(query, (document_id,))
    
    return {"flashcards": flashcards}


# AI Tutor endpoints
@app.post("/api/tutor/ask")
async def ask_tutor(request: QuestionRequest):
    """Ask the AI tutor a question"""
    
    # Get relevant context using semantic search
    query_embedding = embedding_service.encode_single(request.question)
    
    context_results = db.search_embeddings(
        query_embedding,
        limit=5,
        document_id=request.document_id
    )
    
    # Combine context
    context = "\n\n".join([r['content'] for r in context_results])
    
    # Get answer from LLM
    answer = llm_client.answer_question(
        request.question,
        context,
        request.chat_history
    )
    
    return {
        "answer": answer,
        "sources": [
            {
                "document_id": r['document_id'],
                "document_title": r['document_title'],
                "page": r['page_number']
            }
            for r in context_results
        ]
    }


# Statistics endpoints
@app.get("/api/stats/overview")
async def get_stats():
    """Get platform statistics"""
    
    stats = {}
    
    # Document count
    result = db.execute_query("SELECT COUNT(*) as count FROM documents")
    stats['total_documents'] = result[0]['count']
    
    # Concept count
    result = db.execute_query("SELECT COUNT(*) as count FROM concepts")
    stats['total_concepts'] = result[0]['count']
    
    # Question count
    result = db.execute_query("SELECT COUNT(*) as count FROM questions")
    stats['total_questions'] = result[0]['count']
    
    # Flashcard count
    result = db.execute_query("SELECT COUNT(*) as count FROM flashcards")
    stats['total_flashcards'] = result[0]['count']
    
    return stats


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
