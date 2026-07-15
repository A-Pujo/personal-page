"""
Document Processor - Orchestrates the complete processing pipeline
"""
import logging
from pathlib import Path
from typing import Dict, List
import time

from parser.pdf_parser import PDFParser
from embedding.service import embedding_service
from extractor.knowledge import knowledge_extractor
from llm.client import llm_client
from database import db
from config import settings

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Orchestrates document processing pipeline"""
    
    def __init__(self):
        self.db = db
        self.embedding_service = embedding_service
        self.knowledge_extractor = knowledge_extractor
        self.llm = llm_client
    
    def process_document(
        self,
        pdf_path: str,
        generate_summaries: bool = True,
        generate_exercises: bool = True,
        generate_flashcards: bool = True
    ) -> int:
        """
        Process a document through the complete pipeline
        
        Args:
            pdf_path: Path to PDF file
            generate_summaries: Whether to generate summaries
            generate_exercises: Whether to generate exercises
            generate_flashcards: Whether to generate flashcards
        
        Returns:
            Document ID
        """
        start_time = time.time()
        logger.info(f"Starting processing for {pdf_path}")
        
        # Step 1: Parse PDF
        logger.info("Step 1: Parsing PDF")
        doc_id = self._parse_and_store_pdf(pdf_path)
        self._update_document_status(doc_id, 'PARSING')
        
        # Step 2: Extract sections
        logger.info("Step 2: Extracting sections")
        sections = self._extract_sections(doc_id, pdf_path)
        self._update_document_status(doc_id, 'SECTION_DETECTION')
        
        # Step 3: Create chunks and embeddings
        logger.info("Step 3: Creating chunks and embeddings")
        self._create_chunks_and_embeddings(doc_id, sections)
        self._update_document_status(doc_id, 'EMBEDDING')
        
        # Step 4: Extract knowledge
        logger.info("Step 4: Extracting knowledge")
        self._extract_knowledge(doc_id, sections)
        self._update_document_status(doc_id, 'KNOWLEDGE_EXTRACTION')
        
        # Step 5: Generate summaries
        if generate_summaries:
            logger.info("Step 5: Generating summaries")
            self._generate_summaries(doc_id, sections)
            self._update_document_status(doc_id, 'SUMMARY_GENERATION')
        
        # Step 6: Generate exercises
        if generate_exercises:
            logger.info("Step 6: Generating exercises")
            self._generate_exercises(doc_id, sections)
            self._update_document_status(doc_id, 'EXERCISE_GENERATION')
        
        # Step 7: Generate flashcards
        if generate_flashcards:
            logger.info("Step 7: Generating flashcards")
            self._generate_flashcards(doc_id)
        
        # Final status
        self._update_document_status(doc_id, 'COMPLETED')
        
        elapsed = time.time() - start_time
        logger.info(f"Document processing completed in {elapsed:.2f} seconds")
        
        return doc_id
    
    def _parse_and_store_pdf(self, pdf_path: str) -> int:
        """Parse PDF and store in database"""
        pdf_path = Path(pdf_path)
        
        with PDFParser(pdf_path) as parser:
            metadata = parser.extract_metadata()

            # Only read the cover pages (title/authors/abstract/TOC) for
            # classification - plenty of signal without paying to send
            # (or extract) the whole document.
            cover_page_count = min(3, metadata['page_count'])
            cover_text = "\n".join(
                parser.extract_text(page_num=i) for i in range(cover_page_count)
            )

            classification = self.knowledge_extractor.classify_document(cover_text)

            # Store document
            query = """
                INSERT INTO documents
                (filename, title, file_path, file_size, total_pages, document_type, field, subject_area, confidence, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """

            doc_id = self.db.execute_insert(query, (
                pdf_path.name,
                metadata['title'],
                str(pdf_path),
                metadata['file_size'],
                metadata['page_count'],
                classification['material_type'],
                classification['field'],
                classification['subject_area'],
                classification['confidence'],
                'UPLOADED'
            ))
            
            logger.info(f"Document stored with ID: {doc_id}")
            return doc_id
    
    def _extract_sections(self, doc_id: int, pdf_path: str) -> List[Dict]:
        """Extract and store document sections"""
        with PDFParser(pdf_path) as parser:
            sections = parser.detect_sections()
            
            # Store sections
            for idx, section in enumerate(sections):
                query = """
                    INSERT INTO document_sections
                    (document_id, section_type, title, content, page_start, order_index)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                """
                
                section_id = self.db.execute_insert(query, (
                    doc_id,
                    section['type'],
                    section['title'],
                    section['content'],
                    section['start_page'],
                    idx
                ))
                
                section['id'] = section_id
            
            logger.info(f"Stored {len(sections)} sections")
            return sections
    
    def _create_chunks_and_embeddings(self, doc_id: int, sections: List[Dict]):
        """Create chunks and generate embeddings"""
        chunk_size = settings.chunk_size
        chunk_overlap = settings.chunk_overlap
        
        all_chunks = []
        
        for section in sections:
            content = section['content']
            words = content.split()
            
            # Create overlapping chunks
            for i in range(0, len(words), chunk_size - chunk_overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_text = ' '.join(chunk_words)
                
                if len(chunk_text.strip()) > 50:  # Minimum chunk size
                    all_chunks.append({
                        'document_id': doc_id,
                        'section_id': section['id'],
                        'content': chunk_text,
                        'chunk_index': len(all_chunks),
                        'token_count': len(chunk_words)
                    })
        
        # Store chunks and generate embeddings
        logger.info(f"Generating embeddings for {len(all_chunks)} chunks")
        
        # Batch process
        batch_size = 32
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            texts = [chunk['content'] for chunk in batch]
            
            # Generate embeddings
            embeddings = self.embedding_service.encode(texts)
            
            # Store chunks and embeddings
            for chunk, embedding in zip(batch, embeddings):
                # Insert chunk
                chunk_query = """
                    INSERT INTO chunks
                    (document_id, section_id, content, chunk_index, token_count)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id
                """
                
                chunk_id = self.db.execute_insert(chunk_query, (
                    chunk['document_id'],
                    chunk['section_id'],
                    chunk['content'],
                    chunk['chunk_index'],
                    chunk['token_count']
                ))
                
                # Insert embedding
                embedding_list = embedding.tolist()
                embedding_query = """
                    INSERT INTO embeddings
                    (chunk_id, embedding, model_name)
                    VALUES (%s, %s, %s)
                """
                
                self.db.execute_update(embedding_query, (
                    chunk_id,
                    embedding_list,
                    settings.embedding_model
                ))
        
        logger.info(f"Stored {len(all_chunks)} chunks with embeddings")
    
    def _split_text(self, text: str, max_chars: int = 3000, overlap_chars: int = 300) -> List[str]:
        """Split text into overlapping chunks bounded by character count,
        so long sections can be processed by the LLM without truncating
        (and biasing extraction toward) just the start of the text."""
        if len(text) <= max_chars:
            return [text]

        chunks = []
        step = max_chars - overlap_chars
        for start in range(0, len(text), step):
            chunks.append(text[start:start + max_chars])

        return chunks

    def _extract_knowledge(self, doc_id: int, sections: List[Dict]):
        """Extract concepts and knowledge from sections"""
        for section in sections:
            if len(section['content']) < 100:
                continue

            # Extract concepts from each chunk and merge, so nothing past
            # the first 3000 chars of a long section gets silently dropped
            seen_names = set()
            concepts = []
            for chunk in self._split_text(section['content']):
                for concept_data in self.knowledge_extractor.extract_concepts(chunk):
                    name = concept_data.get('name', '').strip()
                    key = name.lower()
                    if not name or key in seen_names:
                        continue
                    seen_names.add(key)
                    concepts.append(concept_data)

            for concept_data in concepts:
                # Check if concept already exists
                check_query = "SELECT id FROM concepts WHERE name = %s"
                result = self.db.execute_query(check_query, (concept_data.get('name', ''),))
                
                if result:
                    concept_id = result[0]['id']
                else:
                    # Insert new concept
                    concept_query = """
                        INSERT INTO concepts (name, definition, concept_type)
                        VALUES (%s, %s, %s)
                        RETURNING id
                    """
                    
                    concept_id = self.db.execute_insert(concept_query, (
                        concept_data.get('name', ''),
                        concept_data.get('definition', ''),
                        concept_data.get('type', 'general')
                    ))
                
                # Link concept to document
                occurrence_query = """
                    INSERT INTO concept_occurrences (concept_id, document_id)
                    VALUES (%s, %s)
                """
                self.db.execute_update(occurrence_query, (concept_id, doc_id))
        
        logger.info("Knowledge extraction completed")
    
    def _generate_summaries(self, doc_id: int, sections: List[Dict]):
        """Generate summaries for sections"""
        summary_types = ['quick', 'detailed', 'academic']

        for section in sections:
            if len(section['content']) < 200:
                continue

            for summary_type in summary_types:
                try:
                    summary = self.llm.generate_summary(
                        section['content'][:3000],  # Limit text length
                        summary_type
                    )

                    query = """
                        INSERT INTO summaries
                        (document_id, section_id, summary_type, content, generated_by)
                        VALUES (%s, %s, %s, %s, %s)
                    """

                    self.db.execute_update(query, (
                        doc_id,
                        section['id'],
                        summary_type,
                        summary,
                        'DeepSeek'
                    ))
                except Exception as e:
                    logger.error(f"Failed to generate {summary_type} summary: {e}")

        self._generate_structured_summary(doc_id, sections)

        logger.info("Summary generation completed")

    def _generate_structured_summary(self, doc_id: int, sections: List[Dict]):
        """Generate a single whole-document summary (Introduction/Data/Method/
        Findings/Conclusion, max 15 paragraphs), built only from the sections
        that actually carry that narrative content."""
        relevant_types = {'abstract', 'introduction', 'methodology', 'results', 'discussion', 'conclusion'}
        relevant_sections = [s for s in sections if s['type'] in relevant_types and s['content'].strip()]

        if not relevant_sections:
            logger.info("No relevant sections found for structured summary; skipping")
            return

        sections_text = "\n\n".join(
            f"[{section['title']}]\n{section['content'][:1500]}"
            for section in relevant_sections
        )

        try:
            summary = self.llm.generate_structured_summary(sections_text)

            query = """
                INSERT INTO summaries
                (document_id, section_id, summary_type, content, generated_by)
                VALUES (%s, %s, %s, %s, %s)
            """

            self.db.execute_update(query, (
                doc_id,
                None,
                'structured',
                summary,
                'DeepSeek'
            ))
        except Exception as e:
            logger.error(f"Failed to generate structured summary: {e}")
    
    def _generate_exercises(self, doc_id: int, sections: List[Dict]):
        """Generate exercises from sections"""
        for section in sections:
            if len(section['content']) < 300:
                continue
            
            try:
                questions = self.llm.generate_questions(
                    section['content'][:2000],
                    num_questions=3,
                    difficulty='medium'
                )
                
                for question_data in questions:
                    query = """
                        INSERT INTO questions
                        (document_id, question_type, difficulty, question_text, 
                         options, correct_answer, explanation)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """
                    
                    import json
                    self.db.execute_update(query, (
                        doc_id,
                        question_data.get('type', 'short_answer'),
                        question_data.get('difficulty', 'medium'),
                        question_data.get('question', ''),
                        json.dumps(question_data.get('options', [])),
                        question_data.get('correct_answer', ''),
                        question_data.get('explanation', '')
                    ))
            except Exception as e:
                logger.error(f"Failed to generate exercises: {e}")
        
        logger.info("Exercise generation completed")
    
    def _generate_flashcards(self, doc_id: int):
        """Generate flashcards from concepts"""
        # Get concepts for this document
        query = """
            SELECT DISTINCT c.id, c.name, c.definition
            FROM concepts c
            JOIN concept_occurrences co ON c.id = co.concept_id
            WHERE co.document_id = %s
        """
        
        concepts = self.db.execute_query(query, (doc_id,))
        
        for concept in concepts:
            if concept['definition']:
                flashcard_query = """
                    INSERT INTO flashcards
                    (document_id, concept_id, front, back)
                    VALUES (%s, %s, %s, %s)
                """
                
                self.db.execute_update(flashcard_query, (
                    doc_id,
                    concept['id'],
                    f"What is {concept['name']}?",
                    concept['definition']
                ))
        
        logger.info(f"Generated {len(concepts)} flashcards")
    
    def _update_document_status(self, doc_id: int, status: str):
        """Update document processing status"""
        query = "UPDATE documents SET status = %s WHERE id = %s"
        self.db.execute_update(query, (status, doc_id))
        logger.info(f"Document status updated to: {status}")


# Global document processor instance
document_processor = DocumentProcessor()
