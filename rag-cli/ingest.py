"""
Document ingestion pipeline.

Reads all .txt and .pdf files from ./docs/, chunks them semantically,
generates Voyage AI embeddings, and stores everything in ChromaDB.

Run this once before using ask.py or eval.py. Re-run after adding new documents.
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import voyageai
import chromadb
import pdfplumber

from chunker import chunk_text
from rag_pipeline import (
    CHROMA_PATH, COLLECTION_NAME, EMBEDDING_MODEL, _get_voyage
)

load_dotenv()

DOCS_DIR = Path("./docs")
BATCH_SIZE = 64  # Voyage API batch limit for embeddings


def load_txt(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def load_pdf(path: Path) -> str:
    """Extract text from PDF, joining pages with double newlines."""
    pages = []
    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if text:
                pages.append(text.strip())
    return "\n\n".join(pages)


def load_documents(docs_dir: Path) -> list[dict]:
    """Load all .txt and .pdf files. Returns list of {source, text}."""
    documents = []
    for path in sorted(docs_dir.iterdir()):
        if path.suffix == ".txt":
            print(f"  Loading {path.name} (text)")
            documents.append({"source": path.name, "text": load_txt(path)})
        elif path.suffix == ".pdf":
            print(f"  Loading {path.name} (PDF)")
            documents.append({"source": path.name, "text": load_pdf(path)})
        else:
            print(f"  Skipping {path.name} (unsupported type)")
    return documents


def ingest():
    if not DOCS_DIR.exists():
        print(f"Error: {DOCS_DIR} not found. Create it and add documents.")
        sys.exit(1)

    print("=== Step 1: Loading documents ===")
    documents = load_documents(DOCS_DIR)
    if not documents:
        print("No documents found in ./docs/")
        sys.exit(1)
    print(f"Loaded {len(documents)} document(s)")

    print("\n=== Step 2: Chunking (semantic paragraph boundaries) ===")
    # Chunking strategy: paragraph boundaries, ~400 tokens, 50-token overlap
    # See chunker.py for the rationale
    all_chunks = []
    for doc in documents:
        chunks = chunk_text(doc["text"], source=doc["source"])
        print(f"  {doc['source']}: {len(chunks)} chunks")
        all_chunks.extend(chunks)
    print(f"Total chunks: {len(all_chunks)}")

    print("\n=== Step 3: Generating embeddings (Voyage AI voyage-3-lite) ===")
    vo = _get_voyage()
    texts = [c["text"] for c in all_chunks]

    embeddings = []
    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        print(f"  Embedding batch {i // BATCH_SIZE + 1} ({len(batch)} chunks)...")
        # input_type="document" applies document-specific embedding optimizations
        result = vo.embed(batch, model=EMBEDDING_MODEL, input_type="document")
        embeddings.extend(result.embeddings)
    print(f"Generated {len(embeddings)} embeddings")

    print("\n=== Step 4: Storing in ChromaDB ===")
    client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Delete and recreate to allow clean re-ingestion
    try:
        client.delete_collection(COLLECTION_NAME)
        print("  Cleared existing collection")
    except Exception:
        pass

    collection = client.create_collection(COLLECTION_NAME)

    ids = [f"chunk_{i}" for i in range(len(all_chunks))]
    metadatas = [
        {
            "source": c["source"],
            "section": c["section"],
            "chunk_index": c["chunk_index"],
        }
        for c in all_chunks
    ]

    collection.add(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    print(f"Stored {len(all_chunks)} chunks in ChromaDB at {CHROMA_PATH}")
    print("\nIngestion complete. Run: python ask.py \"your question here\"")


if __name__ == "__main__":
    ingest()
