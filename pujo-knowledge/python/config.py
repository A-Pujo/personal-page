"""
Configuration module for AI Study Platform
"""
import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://postgres:123456@localhost:5432/alnpj"
    database_schema: str = "knowledge"
    
    # DeepSeek
    deepseek_url: str = "https://api.deepseek.com"
    deepseek_api_key: str = ""
    deepseek_model_flash: str = "deepseek-v4-flash"
    deepseek_model_pro: str = "deepseek-v4-pro"
    
    # Embedding Model
    embedding_model: str = "BAAI/bge-m3"
    embedding_dimension: int = 1024
    
    # Storage Paths
    storage_path: Path = Path(__file__).parent.parent / "storage"
    pdf_path: Path = storage_path / "pdf"
    images_path: Path = storage_path / "images"
    thumbnails_path: Path = storage_path / "thumbnails"
    embeddings_path: Path = storage_path / "embeddings"
    
    # Processing
    chunk_size: int = 800
    chunk_overlap: int = 100
    max_tokens: int = 4096
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()

# Ensure storage directories exist
settings.pdf_path.mkdir(parents=True, exist_ok=True)
settings.images_path.mkdir(parents=True, exist_ok=True)
settings.thumbnails_path.mkdir(parents=True, exist_ok=True)
settings.embeddings_path.mkdir(parents=True, exist_ok=True)
