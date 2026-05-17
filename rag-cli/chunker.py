"""
Semantic chunker for piano pedagogy documents.

Why paragraph boundaries instead of fixed character counts:
  Piano pedagogy knowledge is relational — a piece description contains the title,
  grade level, and technique notes together. Splitting mid-paragraph would separate
  "Minuet in D develops left-hand independence" from its explanation, making both
  halves useless for retrieval. Paragraph breaks are the natural semantic unit.

Why ~400 tokens (~1600 chars) with 50-token (~200 char) overlap:
  400 tokens fits a complete piece description or technique explanation.
  5 retrieved chunks × 400 tokens = ~2000 tokens of context — enough to answer
  most teacher queries without overwhelming Claude's context window.
  Overlap prevents losing concepts that span paragraph boundaries.
"""

import re
from typing import Optional


def _detect_section(line: str) -> Optional[str]:
    """Return section title if this line looks like a header, else None."""
    stripped = line.strip()
    if stripped.startswith("##"):
        return stripped.lstrip("#").strip()
    if stripped.startswith("# "):
        return stripped.lstrip("#").strip()
    if re.match(r"^[A-Z][A-Z\s\-]{5,}$", stripped):  # ALL CAPS header
        return stripped
    return None


def chunk_text(
    text: str,
    source: str,
    max_chars: int = 1600,
    overlap_chars: int = 200,
) -> list[dict]:
    """
    Split text into semantically coherent chunks with metadata.

    Args:
        text: Full document text.
        source: Filename — stored in each chunk's metadata for citations.
        max_chars: Target max chunk size (~400 tokens). Chunks may exceed this
                   slightly to avoid splitting mid-paragraph.
        overlap_chars: Characters of overlap between adjacent chunks (~50 tokens).

    Returns:
        List of dicts: {text, source, section, chunk_index}
    """
    paragraphs = [p.strip() for p in re.split(r"\n\s*\n", text) if p.strip()]

    chunks = []
    current_chunk_parts: list[str] = []
    current_chars = 0
    current_section = "Introduction"
    chunk_index = 0

    for para in paragraphs:
        # Track section headers without adding them as standalone chunks
        detected = _detect_section(para)
        if detected:
            current_section = detected

        para_chars = len(para)

        # If adding this paragraph would exceed the limit AND we have content,
        # emit the current chunk first
        if current_chars + para_chars > max_chars and current_chunk_parts:
            chunk_text_val = "\n\n".join(current_chunk_parts)
            chunks.append({
                "text": chunk_text_val,
                "source": source,
                "section": current_section,
                "chunk_index": chunk_index,
            })
            chunk_index += 1

            # Overlap: carry the last paragraph(s) into the next chunk so
            # concepts spanning a boundary aren't lost
            overlap_text = current_chunk_parts[-1] if current_chunk_parts else ""
            current_chunk_parts = [overlap_text] if len(overlap_text) <= overlap_chars * 2 else []
            current_chars = len("\n\n".join(current_chunk_parts))

        current_chunk_parts.append(para)
        current_chars += para_chars + 2  # +2 for the \n\n separator

    # Emit the final chunk
    if current_chunk_parts:
        chunks.append({
            "text": "\n\n".join(current_chunk_parts),
            "source": source,
            "section": current_section,
            "chunk_index": chunk_index,
        })

    return chunks
