"""Compare embedding models for the knowledge base, retrieval only (no answer generation).

Offline: the knowledge files are chunked the way the data source is configured (fixed size,
400 tokens, 15% overlap), every chunk is embedded with each model through bedrock-runtime, and
each question is answered by cosine top-k over the same chunks. Optionally the live knowledge
base is queried too (Retrieve API, hybrid search, as the chat does), as a check on the offline
Titan numbers.

    aws s3 sync s3://<docs-bucket>/knowledge/ <docs-dir>/      # the files the KB ingests
    python embedding_eval.py --docs <docs-dir> [--kb-id <id>] [--cache <dir>]

Needs boto3 and numpy. Embeddings are cached in --cache, so re-runs cost nothing.
Writes embedding_results.md and embedding_results.json next to this file.
"""
import argparse
import hashlib
import json
import re
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import boto3
import numpy as np
from botocore.config import Config

HERE = Path(__file__).resolve().parent
REGION = "us-east-1"
CHUNK_TOKENS, OVERLAP = 400, 0.15
KS = (1, 3, 5)
PRICE_PER_M = {"titan-v2": 0.02, "cohere-v4": 0.12}   # USD per 1M input tokens, us-east-1 on-demand

brt = boto3.client("bedrock-runtime", region_name=REGION,
                   config=Config(retries={"max_attempts": 10, "mode": "adaptive"}))

# One token per CJK character, per word, per punctuation mark: close enough to subword tokenizers
# for chunk sizing, and both models get identical chunks either way.
TOKEN_RE = re.compile(r"[㐀-鿿豈-﫿]|[A-Za-z0-9_]+|[^\sA-Za-z0-9_㐀-鿿豈-﫿]")


def chunk(text: str) -> list[str]:
    spans = [m.span() for m in TOKEN_RE.finditer(text)]
    step = int(CHUNK_TOKENS * (1 - OVERLAP))
    out = []
    for start in range(0, max(len(spans), 1), step):
        part = spans[start:start + CHUNK_TOKENS]
        if not part:
            break
        out.append(text[part[0][0]:part[-1][1]])
        if start + CHUNK_TOKENS >= len(spans):
            break
    return out


def load_chunks(docs: Path) -> list[dict]:
    chunks = []
    for f in sorted(docs.rglob("*.md")):
        for t in chunk(f.read_text(encoding="utf-8", errors="replace")):
            chunks.append({"file": f.name, "text": t})
    return chunks


def count_tokens(texts) -> int:
    return sum(len(TOKEN_RE.findall(t)) for t in texts)


def titan(texts: list[str], _kind: str) -> np.ndarray:
    def one(t):
        body = json.dumps({"inputText": t, "dimensions": 1024, "normalize": True})
        res = brt.invoke_model(modelId="amazon.titan-embed-text-v2:0", body=body)
        return json.loads(res["body"].read())["embedding"]
    with ThreadPoolExecutor(8) as pool:
        return np.array(list(pool.map(one, texts)), dtype=np.float32)


def cohere(texts: list[str], kind: str) -> np.ndarray:
    out = []
    for i in range(0, len(texts), 64):
        body = json.dumps({"texts": texts[i:i + 64], "input_type": f"search_{kind}",
                           "embedding_types": ["float"], "output_dimension": 1024, "truncate": "END"})
        res = brt.invoke_model(modelId="us.cohere.embed-v4:0", body=body)
        out.extend(json.loads(res["body"].read())["embeddings"]["float"])
    return np.array(out, dtype=np.float32)


MODELS = {"titan-v2": titan, "cohere-v4": cohere}


def embed_cached(model: str, texts: list[str], kind: str, cache: Path) -> np.ndarray:
    key = hashlib.sha256(("\x00".join(texts)).encode()).hexdigest()[:16]
    path = cache / f"{model}-{kind}-{key}.npy"
    if path.exists():
        return np.load(path)
    t0 = time.time()
    vecs = MODELS[model](texts, kind)
    print(f"  {model} {kind}: {len(texts)} texts in {time.time() - t0:.0f}s")
    np.save(path, vecs)
    return vecs


def first_hit(ranked_files: list[str], expect: list[str]) -> int | None:
    for i, f in enumerate(ranked_files):
        if f in expect:
            return i + 1
    return None


def score(ranks: list[int | None]) -> dict:
    n = len(ranks)
    s = {f"hit@{k}": sum(1 for r in ranks if r and r <= k) / n for k in KS}
    s["MRR@10"] = sum(1 / r for r in ranks if r and r <= 10) / n
    return s


def kb_ranks(kb_id: str, questions: list[dict]) -> list[int | None]:
    agent = boto3.client("bedrock-agent-runtime", region_name=REGION)
    ranks = []
    for q in questions:
        for attempt in range(18):
            try:
                res = agent.retrieve(knowledgeBaseId=kb_id, retrievalQuery={"text": q["q"]},
                                     retrievalConfiguration={"vectorSearchConfiguration": {
                                         "numberOfResults": 10, "overrideSearchType": "HYBRID"}})
                break
            except Exception as exc:          # Aurora may still be resuming from 0 ACU
                if attempt == 17:
                    raise
                print(f"  retrieve retry: {exc.__class__.__name__}")
                time.sleep(10)
        files = [r["location"]["s3Location"]["uri"].rsplit("/", 1)[-1] for r in res["retrievalResults"]]
        ranks.append(first_hit(files, q["expect"]))
    return ranks


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--docs", required=True, type=Path)
    ap.add_argument("--cache", type=Path, default=HERE / ".cache")
    ap.add_argument("--kb-id", help="also query the live knowledge base (hybrid search)")
    args = ap.parse_args()
    args.cache.mkdir(parents=True, exist_ok=True)

    questions = json.loads((HERE / "embedding_questions.json").read_text(encoding="utf-8"))["questions"]
    chunks = load_chunks(args.docs)
    files = [c["file"] for c in chunks]
    missing = {e for q in questions for e in q["expect"]} - set(files)
    if missing:
        raise SystemExit(f"expected files not in --docs: {sorted(missing)}")
    doc_tokens = count_tokens(c["text"] for c in chunks)
    print(f"{len(chunks)} chunks from {len(set(files))} files, ~{doc_tokens:,} tokens")

    results, detail = {}, {q["id"]: {"q": q["q"]} for q in questions}
    for model in MODELS:
        D = embed_cached(model, [c["text"] for c in chunks], "document", args.cache)
        Q = embed_cached(model, [q["q"] for q in questions], "query", args.cache)
        D = D / np.linalg.norm(D, axis=1, keepdims=True)
        Q = Q / np.linalg.norm(Q, axis=1, keepdims=True)
        sims = Q @ D.T
        ranks = []
        for qi, q in enumerate(questions):
            top = np.argsort(-sims[qi])[:10]
            ranked = [files[i] for i in top]
            r = first_hit(ranked, q["expect"])
            ranks.append(r)
            detail[q["id"]][model] = {"rank": r, "top3": ranked[:3]}
        results[model] = ranks

    if args.kb_id:
        results["titan-v2 live KB (hybrid)"] = kb_ranks(args.kb_id, questions)
        for q, r in zip(questions, results["titan-v2 live KB (hybrid)"]):
            detail[q["id"]]["live"] = {"rank": r}

    groups = {"all": lambda q: True, "zh questions": lambda q: q["lang"] == "zh",
              "en questions": lambda q: q["lang"] == "en", "cross-language": lambda q: q.get("xling")}
    table = {}
    for name, ranks in results.items():
        table[name] = {g: {"n": sum(1 for q in questions if f(q)),
                           **score([r for q, r in zip(questions, ranks) if f(q)])} for g, f in groups.items()}

    write_report(table, detail, questions, len(chunks), len(set(files)), doc_tokens)
    (HERE / "embedding_results.json").write_text(
        json.dumps({"table": table, "per_question": detail}, ensure_ascii=False, indent=1), encoding="utf-8")
    print((HERE / "embedding_results.md").read_text(encoding="utf-8"))


def write_report(table, detail, questions, n_chunks, n_files, doc_tokens):
    L = ["# Embedding model eval: Titan Text Embeddings V2 vs Cohere Embed v4", "",
         f"Generated by `embedding_eval.py` on {time.strftime('%Y-%m-%d')}. {len(questions)} questions "
         f"(`embedding_questions.json`), {n_chunks} chunks from {n_files} knowledge files "
         f"(~{doc_tokens:,} tokens; fixed 400-token chunks, 15% overlap). Offline rows: pure vector "
         "search, cosine, 1024 dimensions. A hit = a chunk from an expected file in the top k.", ""]
    for g in next(iter(table.values())):
        L += [f"## {g} (n = {next(iter(table.values()))[g]['n']})", "",
              "| model | hit@1 | hit@3 | hit@5 | MRR@10 |", "|---|---|---|---|---|"]
        for name, t in table.items():
            s = t[g]
            L.append(f"| {name} | {s['hit@1']:.0%} | {s['hit@3']:.0%} | {s['hit@5']:.0%} | {s['MRR@10']:.2f} |")
        L.append("")
    L += ["## Per question (rank of first relevant chunk, - = not in top 10)", "",
          "| # | lang | question | titan-v2 | cohere-v4 | live KB |", "|---|---|---|---|---|---|"]
    for q in questions:
        d = detail[q["id"]]
        cell = lambda k: str(d[k]["rank"] or "-") if k in d else ""
        L.append(f"| {q['id']} | {q['lang']}{' x' if q.get('xling') else ''} | {q['q']} | "
                 f"{cell('titan-v2')} | {cell('cohere-v4')} | {cell('live')} |")
    L += ["", "## Cost to embed this corpus once", "",
          "| model | USD per 1M tokens | one full ingest | per 1,000 questions (~15 tokens each) |",
          "|---|---|---|---|"]
    for m, p in PRICE_PER_M.items():
        L.append(f"| {m} | ${p:.2f} | ${doc_tokens * p / 1e6:.4f} | ${15_000 * p / 1e6:.4f} |")
    L.append("")
    (HERE / "embedding_results.md").write_text("\n".join(L), encoding="utf-8")


if __name__ == "__main__":
    main()
