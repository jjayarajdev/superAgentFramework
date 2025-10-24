"""
Documents API router for RAG knowledge base.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime

from rag.service import get_rag_service

router = APIRouter()

# In-memory storage for document metadata
_documents = {}


class SearchRequest(BaseModel):
    """Search request model."""
    query: str
    n_results: int = 5


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    metadata_json: Optional[str] = Form(None)
):
    """
    Upload document to knowledge base for RAG ingestion.

    Supports: PDF, DOCX, TXT, MD
    """
    # Validate file type
    extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
    if extension not in ['pdf', 'docx', 'txt', 'md']:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: .{extension}. Supported: PDF, DOCX, TXT, MD"
        )

    try:
        # Read file content
        content = await file.read()

        # Parse metadata if provided
        metadata = None
        if metadata_json:
            import json
            metadata = json.loads(metadata_json)

        # Ingest via RAG service
        rag_service = get_rag_service()
        result = await rag_service.ingest_file(
            file_content=content,
            filename=file.filename,
            metadata=metadata
        )

        # Store metadata
        document = {
            "document_id": result["document_id"],
            "filename": result["filename"],
            "char_count": result["char_count"],
            "chunk_count": result["chunk_count"],
            "total_tokens": result["total_tokens"],
            "upload_date": datetime.now().isoformat(),
            "status": "indexed"
        }
        _documents[result["document_id"]] = document

        return document

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )


@router.get("/")
async def list_documents() -> Dict[str, List[Dict[str, Any]]]:
    """List uploaded documents."""
    documents = list(_documents.values())
    return {"documents": documents}


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    """Delete document from RAG system."""
    try:
        # Delete from vector store
        rag_service = get_rag_service()
        rag_service.delete_document(document_id)

        # Delete from metadata storage
        if document_id in _documents:
            del _documents[document_id]

        return {"status": "deleted", "document_id": document_id}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.post("/search")
async def search_documents(request: SearchRequest):
    """
    Search documents using semantic search.

    Returns relevant chunks with similarity scores.
    """
    try:
        rag_service = get_rag_service()
        results = rag_service.retrieve(
            query=request.query,
            n_results=request.n_results
        )

        return {"results": results, "query": request.query, "count": len(results)}

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Search failed: {str(e)}"
        )


@router.get("/{document_id}")
async def get_document(document_id: str):
    """Get document by ID with all chunks."""
    try:
        rag_service = get_rag_service()
        document = rag_service.get_document(document_id)

        # Merge with metadata if available
        if document_id in _documents:
            document.update(_documents[document_id])

        return document

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document: {str(e)}"
        )


@router.get("/stats/rag")
async def get_rag_stats():
    """Get RAG system statistics."""
    try:
        rag_service = get_rag_service()
        stats = rag_service.get_stats()
        stats["documents_count"] = len(_documents)
        return stats
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get stats: {str(e)}"
        )
