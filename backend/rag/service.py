"""
RAG Service - Main interface for RAG operations.
"""
from typing import List, Dict, Any, Optional
from pathlib import Path
import uuid

from rag.document_processor import DocumentProcessor
from rag.chunking import RecursiveChunker, ChunkingStrategy
from rag.vector_store import VectorStore


class RAGService:
    """
    Main RAG service.

    Orchestrates document processing, chunking, embedding, and retrieval.
    """

    def __init__(
        self,
        collection_name: str = "documents",
        persist_directory: str = "./data/chroma",
        chunking_strategy: Optional[ChunkingStrategy] = None
    ):
        """
        Initialize RAG service.

        Args:
            collection_name: Chroma collection name
            persist_directory: Directory to persist vector store
            chunking_strategy: Optional custom chunking strategy
        """
        self.document_processor = DocumentProcessor()
        self.chunking_strategy = chunking_strategy or RecursiveChunker(
            chunk_size=500,
            chunk_overlap=50
        )
        self.vector_store = VectorStore(
            collection_name=collection_name,
            persist_directory=persist_directory
        )

    async def ingest_file(
        self,
        file_content: bytes,
        filename: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Ingest a file into the RAG system.

        Steps:
        1. Extract text from file
        2. Chunk text
        3. Store chunks in vector store

        Args:
            file_content: File content as bytes
            filename: Original filename
            metadata: Optional metadata

        Returns:
            Ingestion result with document_id and stats
        """
        # Step 1: Extract text
        doc_result = await self.document_processor.process_upload(
            file_content=file_content,
            filename=filename,
            metadata=metadata
        )

        # Step 2: Chunk text
        chunk_metadata = {
            "filename": doc_result["filename"],
            "extension": doc_result["extension"],
            "size_bytes": doc_result["size_bytes"],
            **(metadata or {})
        }

        chunks = self.chunking_strategy.chunk(
            text=doc_result["text"],
            metadata=chunk_metadata
        )

        if not chunks:
            raise ValueError("No chunks generated from document")

        # Step 3: Store in vector store
        document_id = str(uuid.uuid4())

        self.vector_store.add_documents(
            chunks=chunks,
            document_id=document_id
        )

        # Return result
        return {
            "document_id": document_id,
            "filename": doc_result["filename"],
            "extension": doc_result["extension"],
            "char_count": doc_result["char_count"],
            "chunk_count": len(chunks),
            "total_tokens": sum(c.get("token_count", 0) for c in chunks),
            "status": "success"
        }

    def retrieve(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve relevant chunks for a query.

        Args:
            query: Search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filter

        Returns:
            List of relevant chunks with similarity scores
        """
        results = self.vector_store.search(
            query=query,
            n_results=n_results,
            filter_metadata=filter_metadata
        )

        # Format for agents
        formatted_results = []
        for result in results:
            formatted_results.append({
                "document_id": result["metadata"].get("document_id"),
                "filename": result["metadata"].get("filename", "unknown"),
                "text": result["text"],
                "excerpt": result["text"][:200] + "..." if len(result["text"]) > 200 else result["text"],
                "similarity_score": round(result.get("similarity_score", 0), 3),
                "chunk_index": result["metadata"].get("chunk_index", 0),
                "metadata": result["metadata"]
            })

        return formatted_results

    def get_document(self, document_id: str) -> Dict[str, Any]:
        """
        Get document by ID.

        Args:
            document_id: Document ID

        Returns:
            Document with all chunks
        """
        chunks = self.vector_store.get_document_chunks(document_id)

        if not chunks:
            raise ValueError(f"Document not found: {document_id}")

        # Reconstruct document metadata from first chunk
        first_chunk = chunks[0]
        metadata = first_chunk.get("metadata", {})

        return {
            "document_id": document_id,
            "filename": metadata.get("filename", "unknown"),
            "chunk_count": len(chunks),
            "chunks": chunks
        }

    def delete_document(self, document_id: str):
        """
        Delete document by ID.

        Args:
            document_id: Document ID
        """
        self.vector_store.delete_document(document_id)

    def get_stats(self) -> Dict[str, Any]:
        """
        Get RAG system stats.

        Returns:
            Stats dict with chunk count, etc.
        """
        return {
            "total_chunks": self.vector_store.count(),
            "collection_name": self.vector_store.collection_name,
            "persist_directory": self.vector_store.persist_directory
        }


# Global instance
_rag_service = None


def get_rag_service() -> RAGService:
    """
    Get global RAG service instance.

    Returns:
        RAGService instance
    """
    global _rag_service

    if _rag_service is None:
        _rag_service = RAGService(
            collection_name="superagent_docs",
            persist_directory="./data/chroma"
        )

    return _rag_service
