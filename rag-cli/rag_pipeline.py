"""
Shared RAG retrieval and generation logic.

Pipeline:
  1. retrieve() — embed query with Voyage AI, search ChromaDB, return top-k chunks
  2. generate() — call Claude with retrieved chunks injected into the prompt
                  (or without chunks for the --no-rag comparison mode)

Prompt caching: the system prompt is marked with cache_control so repeated
calls reuse the cached prompt, reducing latency and cost on back-to-back queries.
"""

import os
from dotenv import load_dotenv
import voyageai
import chromadb
import anthropic

load_dotenv()

CHROMA_PATH = "./chroma_db"
COLLECTION_NAME = "piano_pedagogy"
EMBEDDING_MODEL = "voyage-3-lite"
GENERATION_MODEL = "claude-sonnet-4-6"
TOP_K = 5

SYSTEM_PROMPT = """You are a piano pedagogy assistant for piano teachers.

Answer questions using ONLY the source documents provided in the user message.
For every factual claim, cite the source using this exact format: [Source: <filename>, Section: <section>]
If the answer is not in the provided documents, say exactly: "This information is not in the indexed documents."
Do not draw on general knowledge — only use what is in the retrieved context."""

_voyage_client: voyageai.Client | None = None
_chroma_collection: chromadb.Collection | None = None
_anthropic_client: anthropic.Anthropic | None = None


def _get_voyage() -> voyageai.Client:
    global _voyage_client
    if _voyage_client is None:
        _voyage_client = voyageai.Client(api_key=os.environ["VOYAGE_API_KEY"])
    return _voyage_client


def _get_collection() -> chromadb.Collection:
    global _chroma_collection
    if _chroma_collection is None:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        _chroma_collection = client.get_or_create_collection(COLLECTION_NAME)
    return _chroma_collection


def _get_anthropic() -> anthropic.Anthropic:
    global _anthropic_client
    if _anthropic_client is None:
        _anthropic_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    return _anthropic_client


def retrieve(query: str, k: int = TOP_K) -> list[dict]:
    """
    Embed the query and return the top-k most similar chunks.

    Returns list of dicts with keys: text, source, section, chunk_index, score
    Score is cosine distance (lower = more similar in ChromaDB's default).
    """
    vo = _get_voyage()
    # input_type="query" applies query-specific embedding optimizations
    query_embedding = vo.embed([query], model=EMBEDDING_MODEL, input_type="query").embeddings[0]

    collection = _get_collection()
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=k,
        include=["documents", "metadatas", "distances"],
    )

    chunks = []
    for doc, meta, dist in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
    ):
        chunks.append({
            "text": doc,
            "source": meta.get("source", "unknown"),
            "section": meta.get("section", "unknown"),
            "chunk_index": meta.get("chunk_index", 0),
            "score": dist,
        })

    return chunks


def generate(query: str, chunks: list[dict] | None = None) -> str:
    """
    Call Claude to answer the query.

    If chunks is provided, they are injected as retrieved context (RAG mode).
    If chunks is None, Claude answers from its training data only (no-RAG mode).

    The system prompt uses cache_control so repeated calls hit the prompt cache,
    reducing latency after the first call.
    """
    client = _get_anthropic()

    if chunks:
        context_blocks = []
        for i, chunk in enumerate(chunks):
            context_blocks.append(
                f"[Document {i+1}]\n"
                f"Source: {chunk['source']} | Section: {chunk['section']}\n\n"
                f"{chunk['text']}"
            )
        context_str = "\n\n---\n\n".join(context_blocks)
        user_message = f"Retrieved documents:\n\n{context_str}\n\n---\n\nQuestion: {query}"
    else:
        user_message = query

    response = client.messages.create(
        model=GENERATION_MODEL,
        max_tokens=1024,
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                # Prompt caching: the system prompt is reused across calls
                "cache_control": {"type": "ephemeral"},
            }
        ],
        messages=[{"role": "user", "content": user_message}],
    )

    return response.content[0].text
