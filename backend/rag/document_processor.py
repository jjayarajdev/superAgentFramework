"""
Document processor for extracting text from various file formats.
"""
from typing import Dict, Any, Optional
from pathlib import Path
import tempfile
import os

try:
    from pypdf import PdfReader
except ImportError:
    from PyPDF2 import PdfReader

from docx import Document as DocxDocument


class DocumentProcessor:
    """
    Extract text from various document formats.

    Supported formats:
    - PDF (.pdf)
    - Word (.docx)
    - Text (.txt, .md)
    """

    def __init__(self):
        """Initialize processor."""
        self.supported_extensions = {'.pdf', '.docx', '.txt', '.md'}

    def process_file(self, file_path: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process a file and extract text.

        Args:
            file_path: Path to file
            metadata: Optional metadata (filename, source, etc.)

        Returns:
            Dict with extracted text and metadata
        """
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        extension = path.suffix.lower()

        if extension not in self.supported_extensions:
            raise ValueError(f"Unsupported file type: {extension}")

        # Extract text based on file type
        if extension == '.pdf':
            text = self._extract_pdf(file_path)
        elif extension == '.docx':
            text = self._extract_docx(file_path)
        else:  # .txt, .md
            text = self._extract_text(file_path)

        # Build result
        result = {
            "text": text,
            "filename": path.name,
            "extension": extension,
            "size_bytes": path.stat().st_size,
            "char_count": len(text),
            "metadata": metadata or {}
        }

        return result

    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF."""
        reader = PdfReader(file_path)

        text_parts = []
        for page_num, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text()
            if page_text.strip():
                text_parts.append(f"[Page {page_num}]\n{page_text}")

        return "\n\n".join(text_parts)

    def _extract_docx(self, file_path: str) -> str:
        """Extract text from Word document."""
        doc = DocxDocument(file_path)

        text_parts = []
        for para in doc.paragraphs:
            if para.text.strip():
                text_parts.append(para.text)

        return "\n\n".join(text_parts)

    def _extract_text(self, file_path: str) -> str:
        """Extract text from plain text file."""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()

    async def process_upload(self, file_content: bytes, filename: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Process an uploaded file (from FastAPI UploadFile).

        Args:
            file_content: File content as bytes
            filename: Original filename
            metadata: Optional metadata

        Returns:
            Dict with extracted text and metadata
        """
        # Save to temp file
        extension = Path(filename).suffix

        with tempfile.NamedTemporaryFile(delete=False, suffix=extension) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name

        try:
            result = self.process_file(tmp_path, metadata)
            result['filename'] = filename  # Use original filename
            return result
        finally:
            # Clean up temp file
            os.unlink(tmp_path)
