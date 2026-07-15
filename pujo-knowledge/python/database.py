"""
Database connection and utilities
"""
import psycopg
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool
from contextlib import contextmanager
from typing import List, Dict, Any, Optional
import logging

from config import settings

logger = logging.getLogger(__name__)


class Database:
    """Database connection manager"""
    
    def __init__(self, connection_string: str = None, schema: str = None):
        self.connection_string = connection_string or settings.database_url
        self.schema = schema or settings.database_schema
        self._conn = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self._conn = psycopg.connect(self.connection_string)
            # Set search_path to use the knowledge schema
            with self._conn.cursor() as cur:
                cur.execute(f"SET search_path TO {self.schema}, public")
            self._conn.commit()
            logger.info(f"Database connected successfully (schema: {self.schema})")
            return self._conn
        except Exception as e:
            logger.error(f"Database connection failed: {e}")
            raise
    
    def close(self):
        """Close database connection"""
        if self._conn:
            self._conn.close()
            logger.info("Database connection closed")
    
    @contextmanager
    def get_cursor(self, dict_cursor=True):
        """Context manager for database cursor"""
        if not self._conn or self._conn.closed:
            self.connect()
        
        row_factory = dict_row if dict_cursor else None
        cursor = self._conn.cursor(row_factory=row_factory)
        try:
            yield cursor
            self._conn.commit()
        except Exception as e:
            self._conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            cursor.close()
    
    def execute_query(self, query: str, params: tuple = None) -> List[Dict]:
        """Execute a SELECT query and return results"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def execute_insert(self, query: str, params: tuple = None) -> Optional[int]:
        """Execute an INSERT query and return the inserted ID"""
        with self.get_cursor() as cursor:
            cursor.execute(query, params)
            result = cursor.fetchone()
            return result['id'] if result else None
    
    def execute_update(self, query: str, params: tuple = None) -> int:
        """Execute an UPDATE query and return rows affected"""
        with self.get_cursor(dict_cursor=False) as cursor:
            cursor.execute(query, params)
            return cursor.rowcount
    
    def bulk_insert(self, table: str, columns: List[str], values: List[tuple]):
        """Bulk insert values into a table"""
        with self.get_cursor(dict_cursor=False) as cursor:
            cols = ', '.join(columns)
            placeholders = ', '.join(['%s'] * len(columns))
            query = f"INSERT INTO {table} ({cols}) VALUES ({placeholders})"
            cursor.executemany(query, values)
    
    def search_embeddings(
        self, 
        query_embedding: List[float], 
        limit: int = 10,
        document_id: Optional[int] = None
    ) -> List[Dict]:
        """Search for similar embeddings using pgvector"""
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        query = """
            SELECT 
                c.id,
                c.content,
                c.document_id,
                c.page_number,
                d.title as document_title,
                e.embedding <=> %s::vector as distance
            FROM embeddings e
            JOIN chunks c ON e.chunk_id = c.id
            JOIN documents d ON c.document_id = d.id
        """
        
        params = [embedding_str]
        
        if document_id:
            query += " WHERE c.document_id = %s"
            params.append(document_id)
        
        query += " ORDER BY distance LIMIT %s"
        params.append(limit)
        
        return self.execute_query(query, tuple(params))


# Global database instance
db = Database()


def init_db():
    """Initialize database connection"""
    db.connect()
    logger.info("Database initialized")


def close_db():
    """Close database connection"""
    db.close()
