-- Local AI Study Platform Database Schema
-- Requires PostgreSQL with pgvector extension
-- Schema: knowledge

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS knowledge;

-- Set search path to knowledge schema
SET search_path TO knowledge, public;

-- Documents table
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    title VARCHAR(500),
    file_path TEXT NOT NULL,
    file_size BIGINT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'UPLOADED',
    document_type VARCHAR(50),
    field VARCHAR(100),
    subject_area VARCHAR(100),
    confidence FLOAT,
    total_pages INTEGER,
    metadata JSONB,
    processed_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_subject ON documents(subject_area);
CREATE INDEX idx_documents_field ON documents(field);

-- Document sections
CREATE TABLE document_sections (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    section_type VARCHAR(100),
    title TEXT,
    content TEXT,
    page_start INTEGER,
    page_end INTEGER,
    order_index INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sections_document ON document_sections(document_id);
CREATE INDEX idx_sections_type ON document_sections(section_type);

-- Chunks for embedding
CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES document_sections(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    page_number INTEGER,
    start_char INTEGER,
    end_char INTEGER,
    token_count INTEGER,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chunks_document ON chunks(document_id);
CREATE INDEX idx_chunks_section ON chunks(section_id);

-- Embeddings with pgvector
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    chunk_id INTEGER REFERENCES chunks(id) ON DELETE CASCADE,
    embedding vector(1024),
    model_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_embeddings_chunk ON embeddings(chunk_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- Subjects/Topics
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES subjects(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Concepts
CREATE TABLE concepts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    definition TEXT,
    concept_type VARCHAR(50),
    subject_id INTEGER REFERENCES subjects(id),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_concepts_name ON concepts(name);
CREATE INDEX idx_concepts_type ON concepts(concept_type);

-- Concept occurrences in documents
CREATE TABLE concept_occurrences (
    id SERIAL PRIMARY KEY,
    concept_id INTEGER REFERENCES concepts(id) ON DELETE CASCADE,
    chunk_id INTEGER REFERENCES chunks(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER,
    context TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_concept_occ_concept ON concept_occurrences(concept_id);
CREATE INDEX idx_concept_occ_document ON concept_occurrences(document_id);

-- Relationships between concepts
CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    source_concept_id INTEGER REFERENCES concepts(id) ON DELETE CASCADE,
    target_concept_id INTEGER REFERENCES concepts(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100),
    strength FLOAT DEFAULT 1.0,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relationships_source ON relationships(source_concept_id);
CREATE INDEX idx_relationships_target ON relationships(target_concept_id);

-- Summaries
CREATE TABLE summaries (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES document_sections(id) ON DELETE CASCADE,
    summary_type VARCHAR(50),
    content TEXT NOT NULL,
    generated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_summaries_document ON summaries(document_id);
CREATE INDEX idx_summaries_type ON summaries(summary_type);

-- Questions/Exercises
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    concept_id INTEGER REFERENCES concepts(id),
    question_type VARCHAR(50),
    difficulty VARCHAR(20),
    question_text TEXT NOT NULL,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    learning_outcome TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_document ON questions(document_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Answers (user submissions)
CREATE TABLE answers (
    id SERIAL PRIMARY KEY,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    user_answer TEXT,
    is_correct BOOLEAN,
    time_spent INTEGER,
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_question ON answers(question_id);

-- Flashcards
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    concept_id INTEGER REFERENCES concepts(id),
    front TEXT NOT NULL,
    back TEXT NOT NULL,
    difficulty VARCHAR(20),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_flashcards_document ON flashcards(document_id);

-- Study sessions
CREATE TABLE study_sessions (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id),
    session_type VARCHAR(50),
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    duration INTEGER,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    metadata JSONB
);

CREATE INDEX idx_sessions_document ON study_sessions(document_id);

-- User progress tracking
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    concept_id INTEGER REFERENCES concepts(id),
    mastery_level FLOAT DEFAULT 0.0,
    last_reviewed TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_progress_document ON user_progress(document_id);
CREATE INDEX idx_progress_concept ON user_progress(concept_id);

-- Annotations
CREATE TABLE annotations (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    page_number INTEGER,
    annotation_type VARCHAR(50),
    content TEXT,
    position JSONB,
    color VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_annotations_document ON annotations(document_id);

-- Citations
CREATE TABLE citations (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    citation_text TEXT,
    cited_work TEXT,
    citation_type VARCHAR(50),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_citations_document ON citations(document_id);

-- Tags
CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Document tags (many-to-many)
CREATE TABLE document_tags (
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, tag_id)
);

-- Processing jobs queue
CREATE TABLE processing_jobs (
    id SERIAL PRIMARY KEY,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    priority INTEGER DEFAULT 0,
    progress FLOAT DEFAULT 0.0,
    error_message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_status ON processing_jobs(status);
CREATE INDEX idx_jobs_document ON processing_jobs(document_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to relevant tables
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
