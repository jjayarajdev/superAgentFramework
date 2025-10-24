"""
RAG (Retrieval-Augmented Generation) package.

Handles document processing, embedding, storage, and retrieval.
"""
from rag.service import RAGService
from rag.document_processor import DocumentProcessor
from rag.chunking import ChunkingStrategy, RecursiveChunker
from rag.vector_store import VectorStore

__all__ = [
    'RAGService',
    'DocumentProcessor',
    'ChunkingStrategy',
    'RecursiveChunker',
    'VectorStore'
]
