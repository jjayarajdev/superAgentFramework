"""
Text chunking strategies for RAG.
"""
from typing import List, Dict, Any
from abc import ABC, abstractmethod
import tiktoken


class ChunkingStrategy(ABC):
    """Base class for chunking strategies."""

    @abstractmethod
    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Chunk text into smaller pieces.

        Args:
            text: Text to chunk
            metadata: Metadata to attach to each chunk

        Returns:
            List of chunks with text and metadata
        """
        pass


class RecursiveChunker(ChunkingStrategy):
    """
    Recursive character-based text chunker.

    Splits text into chunks of approximately chunk_size tokens
    with overlap for context preservation.
    """

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        model_name: str = "gpt-3.5-turbo"
    ):
        """
        Initialize chunker.

        Args:
            chunk_size: Target chunk size in tokens
            chunk_overlap: Overlap between chunks in tokens
            model_name: Model to use for tokenization
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.encoding = tiktoken.encoding_for_model(model_name)

        # Separators in order of preference
        self.separators = ["\n\n", "\n", ". ", " ", ""]

    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Chunk text using recursive splitting."""
        if not text or not text.strip():
            return []

        metadata = metadata or {}

        # Split into chunks
        chunks = self._split_text(text)

        # Build chunk objects
        result = []
        for i, chunk_text in enumerate(chunks):
            chunk_obj = {
                "text": chunk_text,
                "chunk_index": i,
                "chunk_count": len(chunks),
                "token_count": len(self.encoding.encode(chunk_text)),
                "char_count": len(chunk_text),
                "metadata": {**metadata, "chunk_index": i}
            }
            result.append(chunk_obj)

        return result

    def _split_text(self, text: str) -> List[str]:
        """Split text recursively using separators."""
        chunks = []
        current_chunk = ""
        current_tokens = 0

        # Try to split by each separator in order
        for separator in self.separators:
            if separator in text:
                parts = text.split(separator)
                break
        else:
            # No separator found, split by character
            parts = list(text)
            separator = ""

        for part in parts:
            part_with_sep = part + separator if separator else part
            part_tokens = len(self.encoding.encode(part_with_sep))

            if current_tokens + part_tokens <= self.chunk_size:
                # Add to current chunk
                current_chunk += part_with_sep
                current_tokens += part_tokens
            else:
                # Save current chunk and start new one
                if current_chunk:
                    chunks.append(current_chunk.strip())

                # Start new chunk with overlap
                if self.chunk_overlap > 0 and current_chunk:
                    overlap_text = self._get_overlap(current_chunk)
                    current_chunk = overlap_text + part_with_sep
                    current_tokens = len(self.encoding.encode(current_chunk))
                else:
                    current_chunk = part_with_sep
                    current_tokens = part_tokens

        # Add final chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        return chunks

    def _get_overlap(self, text: str) -> str:
        """Get overlap text from end of chunk."""
        tokens = self.encoding.encode(text)

        if len(tokens) <= self.chunk_overlap:
            return text

        overlap_tokens = tokens[-self.chunk_overlap:]
        return self.encoding.decode(overlap_tokens)


class FixedSizeChunker(ChunkingStrategy):
    """
    Simple fixed-size chunker.

    Splits text into fixed-size chunks by character count.
    """

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 100):
        """
        Initialize chunker.

        Args:
            chunk_size: Chunk size in characters
            chunk_overlap: Overlap in characters
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, text: str, metadata: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Chunk text into fixed-size pieces."""
        if not text or not text.strip():
            return []

        metadata = metadata or {}
        chunks = []

        start = 0
        chunk_index = 0

        while start < len(text):
            end = start + self.chunk_size
            chunk_text = text[start:end]

            if chunk_text.strip():
                chunks.append({
                    "text": chunk_text.strip(),
                    "chunk_index": chunk_index,
                    "char_count": len(chunk_text),
                    "metadata": {**metadata, "chunk_index": chunk_index}
                })

            chunk_index += 1
            start = end - self.chunk_overlap

        # Update chunk_count
        for chunk in chunks:
            chunk["chunk_count"] = len(chunks)

        return chunks
