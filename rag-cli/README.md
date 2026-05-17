# Piano Studio Knowledge Assistant — RAG CLI

Phase 1 of the pre-lesson brief feature. A command-line RAG pipeline for answering piano pedagogy questions, grounded in indexed source documents.

## Setup

```bash
cd pianostudio/rag-cli
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Add your keys to .env:
#   ANTHROPIC_API_KEY=...
#   VOYAGE_API_KEY=...  (get one at https://www.voyageai.com)
```

## Quick Start

```bash
# 1. Ingest documents (run once, re-run after adding new docs)
python ingest.py

# 2. Ask a question (RAG mode — retrieves and cites sources)
python ask.py "What pieces develop left-hand independence at Grade 2?"

# 3. Compare: same question without RAG (Claude's training data only)
python ask.py --no-rag "What pieces develop left-hand independence at Grade 2?"

# 4. Run the evaluation harness (pass threshold: 8/10)
python eval.py
```

## What each script does

| Script | Role |
|---|---|
| `chunker.py` | Splits documents at paragraph boundaries (~400 tokens). See comments for why. |
| `rag_pipeline.py` | Shared retrieval (Voyage AI → ChromaDB) and generation (Claude). |
| `ingest.py` | Load → chunk → embed → store. Run this first. |
| `ask.py` | Ask questions. Prints retrieved chunks + scores before the answer. |
| `eval.py` | 10-question test harness. Tells you if retrieval quality is good enough for Phase 2. |

## The RAG pipeline

```
docs/*.txt / *.pdf
      ↓ ingest.py
  parse text
      ↓ chunker.py
  paragraph-boundary chunks (~400 tokens, 50-token overlap)
      ↓ Voyage AI voyage-3-lite (input_type="document")
  embeddings → ChromaDB (./chroma_db/)

query (ask.py)
      ↓ Voyage AI voyage-3-lite (input_type="query")
  query embedding → ChromaDB similarity search → top-5 chunks
      ↓ rag_pipeline.py
  chunks injected into Claude prompt (claude-sonnet-4-6)
  system prompt cached with cache_control: ephemeral
      ↓
  answer with [Source: filename, Section: section] citations
```

## Adding real documents

Replace the sample `.txt` files in `docs/` with real documents:
- ABRSM/RCM syllabus PDFs (check licensing first — see probe notes)
- Method book teacher guides
- ABRSM published examiner reports (these are publicly distributed)

Then re-run `python ingest.py` to rebuild the index.

## Evaluation

`eval.py` runs 10 questions with known ground-truth answers against the sample documents.

**Pass threshold**: 8/10 on both citation presence and ground-truth recall.

- **Citations < 8/10**: Claude isn't grounding answers. Check the system prompt in `rag_pipeline.py`.
- **Ground truth < 8/10**: Retriever isn't finding the right chunks. Try adjusting chunk size or `--k`.

Only proceed to Phase 2 (web UI) after passing the evaluation.

## Phase 2 plan

- Python microservice wrapping this pipeline (FastAPI)
- Spring Boot `/api/rag/brief/{studentId}` endpoint calls the microservice
- React pre-lesson brief component in PianoStudio frontend
- Student context (exam date, active pieces, recent lesson note tags) injected into retrieval query
