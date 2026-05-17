"""
Ask a question with or without RAG.

Usage:
  python ask.py "What pieces develop left-hand independence at Grade 2?"
  python ask.py --no-rag "What pieces develop left-hand independence at Grade 2?"
  python ask.py --k 3 "What are the Grade 3 scale requirements?"

The --no-rag flag skips retrieval entirely and sends the question directly to
Claude. Compare the two outputs to see what RAG adds (or doesn't).
"""

import argparse
from rag_pipeline import retrieve, generate


def main():
    parser = argparse.ArgumentParser(description="Piano pedagogy knowledge assistant")
    parser.add_argument("question", help="Question to ask")
    parser.add_argument(
        "--no-rag",
        action="store_true",
        help="Skip retrieval — ask Claude directly from training data",
    )
    parser.add_argument(
        "--k",
        type=int,
        default=5,
        help="Number of chunks to retrieve (default: 5)",
    )
    args = parser.parse_args()

    if args.no_rag:
        print(f"\nQuestion: {args.question}")
        print("Mode: Claude only (no retrieval)\n")
        print("=" * 60)
        answer = generate(args.question, chunks=None)
        print(answer)
    else:
        print(f"\nQuestion: {args.question}")
        print(f"Mode: RAG (retrieving top {args.k} chunks)\n")

        # Step 1: Retrieve — print chunks so retrieval quality is visible
        print("=" * 60)
        print("RETRIEVED CHUNKS")
        print("=" * 60)
        chunks = retrieve(args.question, k=args.k)

        for i, chunk in enumerate(chunks):
            print(f"\n[{i+1}] Score: {chunk['score']:.4f} | {chunk['source']} — {chunk['section']}")
            # Print a preview of each chunk (first 250 chars)
            preview = chunk["text"][:250].replace("\n", " ")
            print(f"     {preview}{'...' if len(chunk['text']) > 250 else ''}")

        # Step 2: Generate — Claude uses retrieved chunks as context
        print("\n" + "=" * 60)
        print("ANSWER (grounded in retrieved documents)")
        print("=" * 60)
        answer = generate(args.question, chunks=chunks)
        print(answer)


if __name__ == "__main__":
    main()
