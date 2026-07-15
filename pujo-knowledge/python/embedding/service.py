"""
Embedding Service using Sentence Transformers
"""
import logging
from typing import List, Union
import numpy as np
from sentence_transformers import SentenceTransformer
from config import settings

logger = logging.getLogger(__name__)


class EmbeddingService:
    """Service for generating embeddings from text"""
    
    def __init__(self, model_name: str = None):
        self.model_name = model_name or settings.embedding_model
        self.model = None
        self.dimension = settings.embedding_dimension
    
    def load_model(self):
        """Load the embedding model"""
        try:
            logger.info(f"Loading embedding model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            logger.info("Embedding model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            raise
    
    def encode(
        self, 
        texts: Union[str, List[str]], 
        batch_size: int = 32,
        show_progress: bool = False
    ) -> np.ndarray:
        """
        Generate embeddings for text(s)
        
        Args:
            texts: Single text or list of texts
            batch_size: Batch size for encoding
            show_progress: Show progress bar
        
        Returns:
            Numpy array of embeddings
        """
        if not self.model:
            self.load_model()
        
        if isinstance(texts, str):
            texts = [texts]
        
        embeddings = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=show_progress,
            convert_to_numpy=True
        )
        
        return embeddings
    
    def encode_single(self, text: str) -> List[float]:
        """
        Generate embedding for a single text
        
        Args:
            text: Text to encode
        
        Returns:
            List of floats representing the embedding
        """
        if not self.model:
            self.load_model()
        
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    
    def similarity(self, text1: str, text2: str) -> float:
        """
        Calculate cosine similarity between two texts
        
        Args:
            text1: First text
            text2: Second text
        
        Returns:
            Similarity score (0 to 1)
        """
        if not self.model:
            self.load_model()
        
        embeddings = self.encode([text1, text2])
        
        # Cosine similarity
        similarity = np.dot(embeddings[0], embeddings[1]) / (
            np.linalg.norm(embeddings[0]) * np.linalg.norm(embeddings[1])
        )
        
        return float(similarity)
    
    def batch_similarity(self, query: str, texts: List[str]) -> List[float]:
        """
        Calculate similarity between a query and multiple texts
        
        Args:
            query: Query text
            texts: List of texts to compare against
        
        Returns:
            List of similarity scores
        """
        if not self.model:
            self.load_model()
        
        query_embedding = self.encode(query)
        text_embeddings = self.encode(texts)
        
        # Calculate cosine similarities
        similarities = []
        for text_emb in text_embeddings:
            sim = np.dot(query_embedding[0], text_emb) / (
                np.linalg.norm(query_embedding[0]) * np.linalg.norm(text_emb)
            )
            similarities.append(float(sim))
        
        return similarities


# Global embedding service instance
embedding_service = EmbeddingService()


def get_embedding(text: str) -> List[float]:
    """Convenience function to get embedding for text"""
    return embedding_service.encode_single(text)


def get_embeddings(texts: List[str]) -> np.ndarray:
    """Convenience function to get embeddings for multiple texts"""
    return embedding_service.encode(texts)
