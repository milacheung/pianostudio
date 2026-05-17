"""
RAG quality evaluation harness.

Loads questions from eval/questions.json, runs each through the RAG pipeline,
and scores on two criteria:
  1. Citation present: did Claude include a [Source: ...] citation?
  2. Ground truth found: does the answer contain the expected key phrase?

Threshold: 8/10 on both metrics = RAG quality sufficient to proceed to Phase 2.
If you fail, review chunking strategy (chunker.py) and retrieval scores in ask.py.

Usage:
  python eval.py
  python eval.py --verbose   (show full answers)
"""

import argparse
import json
from pathlib import Path
from rag_pipeline import retrieve, generate


QUESTIONS_FILE = Path("eval/questions.json")
PASS_THRESHOLD = 8


def load_questions() -> list[dict]:
    if not QUESTIONS_FILE.exists():
        raise FileNotFoundError(f"{QUESTIONS_FILE} not found. Did you run ingest.py first?")
    with open(QUESTIONS_FILE) as f:
        return json.load(f)


def score_answer(answer: str, ground_truth: str) -> tuple[bool, bool]:
    """Returns (cited, ground_truth_found)."""
    cited = "[Source:" in answer
    found = ground_truth.lower() in answer.lower()
    return cited, found


def run_eval(verbose: bool = False):
    questions = load_questions()
    print(f"Running evaluation on {len(questions)} questions...\n")

    results = []
    for i, q in enumerate(questions):
        print(f"[{i+1}/{len(questions)}] {q['question'][:70]}...")

        chunks = retrieve(q["question"])
        answer = generate(q["question"], chunks=chunks)
        cited, found = score_answer(answer, q["ground_truth"])

        status = "PASS" if (cited and found) else "FAIL"
        print(f"       Citation: {'✓' if cited else '✗'}  |  Ground truth ({q['ground_truth']!r}): {'✓' if found else '✗'}  |  {status}")

        if verbose:
            print(f"\n       Answer:\n       {answer[:400]}\n")

        results.append({
            "question": q["question"],
            "ground_truth": q["ground_truth"],
            "cited": cited,
            "ground_truth_found": found,
            "answer": answer,
        })

    # Summary
    cited_count = sum(1 for r in results if r["cited"])
    found_count = sum(1 for r in results if r["ground_truth_found"])
    both_count = sum(1 for r in results if r["cited"] and r["ground_truth_found"])

    print("\n" + "=" * 60)
    print("EVALUATION SUMMARY")
    print("=" * 60)
    print(f"Questions evaluated : {len(results)}")
    print(f"Citations present   : {cited_count}/{len(results)}")
    print(f"Ground truth found  : {found_count}/{len(results)}")
    print(f"Both passed         : {both_count}/{len(results)}")
    print(f"Pass threshold      : {PASS_THRESHOLD}/{len(results)} on both metrics")
    print()

    if cited_count >= PASS_THRESHOLD and found_count >= PASS_THRESHOLD:
        print("RESULT: PASS — RAG quality sufficient to proceed to Phase 2 (web UI)")
    else:
        print("RESULT: FAIL — Review chunking and retrieval before building the UI")
        if cited_count < PASS_THRESHOLD:
            print("  → Citation failures: Claude is not grounding answers in retrieved docs.")
            print("    Check that chunks contain enough context and the system prompt is clear.")
        if found_count < PASS_THRESHOLD:
            print("  → Ground truth failures: Retriever is not finding the right chunks.")
            print("    Try: smaller chunk sizes, different k, or inspect scores with ask.py.")

    # Show failures for debugging
    failures = [r for r in results if not (r["cited"] and r["ground_truth_found"])]
    if failures:
        print(f"\nFailed questions ({len(failures)}):")
        for r in failures:
            print(f"  - {r['question'][:70]}")
            print(f"    Expected: {r['ground_truth']!r}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--verbose", action="store_true", help="Print full answers")
    args = parser.parse_args()
    run_eval(verbose=args.verbose)
