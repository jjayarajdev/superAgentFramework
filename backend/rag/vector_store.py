"""
Vector store wrapper for Chroma.
"""
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
import uuid
import os


class VectorStore:
    """
    Wrapper for ChromaDB vector store.

    Handles document storage, embedding, and retrieval.
    """

    def __init__(
        self,
        collection_name: str = "documents",
        persist_directory: str = "./data/chroma",
        embedding_function: Optional[Any] = None
    ):
        """
        Initialize vector store.

        Args:
            collection_name: Name of the collection
            persist_directory: Directory to persist data
            embedding_function: Optional custom embedding function
        """
        self.collection_name = collection_name
        self.persist_directory = persist_directory

        # Create persist directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)

        # Initialize Chroma client
        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )

        # Use default embedding function if not provided
        if embedding_function is None:
            from chromadb.utils import embedding_functions
            embedding_function = embedding_functions.DefaultEmbeddingFunction()

        # Get or create collection
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=embedding_function
        )

    def add_documents(
        self,
        chunks: List[Dict[str, Any]],
        document_id: Optional[str] = None
    ) -> str:
        """
        Add document chunks to vector store.

        Args:
            chunks: List of text chunks with metadata
            document_id: Optional document ID (generated if not provided)

        Returns:
            Document ID
        """
        if not chunks:
            raise ValueError("No chunks provided")

        doc_id = document_id or str(uuid.uuid4())

        # Prepare data for Chroma
        ids = []
        documents = []
        metadatas = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{doc_id}_chunk_{i}"
            ids.append(chunk_id)
            documents.append(chunk["text"])

            # Build metadata
            metadata = {
                "document_id": doc_id,
                "chunk_index": chunk.get("chunk_index", i),
                "chunk_count": chunk.get("chunk_count", len(chunks)),
                "char_count": chunk.get("char_count", len(chunk["text"])),
                **chunk.get("metadata", {})
            }
            metadatas.append(metadata)

        # Add to collection
        self.collection.add(
            ids=ids,
            documents=documents,
            metadatas=metadatas
        )

        return doc_id

    def search(
        self,
        query: str,
        n_results: int = 5,
        filter_metadata: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant chunks.

        Args:
            query: Search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filter

        Returns:
            List of search results with text, metadata, and similarity score
        """
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=filter_metadata
        )

        # Format results
        formatted_results = []

        if results and results['ids'] and results['ids'][0]:
            for i in range(len(results['ids'][0])):
                result = {
                    "id": results['ids'][0][i],
                    "text": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i] if results['metadatas'] else {},
                    "distance": results['distances'][0][i] if results.get('distances') else None,
                    "similarity_score": 1 - results['distances'][0][i] if results.get('distances') else None
                }
                formatted_results.append(result)

        return formatted_results

    def get_document_chunks(self, document_id: str) -> List[Dict[str, Any]]:
        """
        Get all chunks for a document.

        Args:
            document_id: Document ID

        Returns:
            List of chunks
        """
        results = self.collection.get(
            where={"document_id": document_id}
        )

        chunks = []
        if results and results['ids']:
            for i in range(len(results['ids'])):
                chunk = {
                    "id": results['ids'][i],
                    "text": results['documents'][i] if results['documents'] else None,
                    "metadata": results['metadatas'][i] if results['metadatas'] else {}
                }
                chunks.append(chunk)

        return chunks

    def delete_document(self, document_id: str):
        """
        Delete all chunks for a document.

        Args:
            document_id: Document ID
        """
        # Get all chunk IDs for this document
        results = self.collection.get(
            where={"document_id": document_id}
        )

        if results and results['ids']:
            self.collection.delete(ids=results['ids'])

    def count(self) -> int:
        """Get total number of chunks in collection."""
        return self.collection.count()

    def reset(self):
        """Reset collection (delete all data)."""
        self.client.delete_collection(name=self.collection_name)
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )
