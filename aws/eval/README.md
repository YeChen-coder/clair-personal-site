# eval/ — should the knowledge base switch from Titan V2 to Cohere Embed v4?

Run on 2026-10-31. Result: **no, keep Amazon Titan Text Embeddings V2.** The numbers are in
`embedding_results.md`, and every question with its rank is in `embedding_results.json`.

## What was measured

- `embedding_questions.json` holds 40 questions a visitor might ask: 21 in Chinese, 19 in English.
  6 of them are cross-language, meaning the answer is only written in the other language.
  Each question lists the files that answer it.
- `embedding_eval.py` measures retrieval only. It chunks the 117 knowledge files the way the data
  source does (400 tokens, 15% overlap, which gives 1,560 chunks) and embeds them with both models
  at 1024 dimensions. Each question is then answered by cosine top-k. As a check, the script also
  queries the live knowledge base with the Retrieve API and hybrid search, the same way the chat does.

| | hit@1 | hit@3 | hit@5 | MRR@10 |
|---|---|---|---|---|
| Titan V2 (offline, vector) | 72% | 88% | 88% | 0.80 |
| Cohere Embed v4 (offline, vector) | 75% | 82% | 88% | 0.81 |
| Titan V2, live KB (hybrid) | 70% | 85% | 88% | 0.77 |

## Why not switch

- **It is a tie.** On English questions both models score the same (100% hit@3). On Chinese
  questions Cohere wins some and loses others (hit@1 67% vs 62%, hit@3 67% vs 76%). On
  cross-language questions both score the same. A one-question swing out of 40 is noise.
- **This is different from JesusSaysHi.** There, Cohere beat Titan by 15 points because the queries
  were paraphrased feelings matched against archaic Bible verses, which is hard semantic matching.
  Here, visitor questions mostly name the project (FOCI, GLM, CloudWatch), and both models find
  that easily. Whether the model matters depends on the data.
- **Switching costs more than it returns.** The embedding model of a knowledge base cannot be changed
  in place. Switching means a new knowledge base and data source, a full resync, and new IDs wired
  into the Lambdas. Cohere is 6× the price per token. That is only about $0.07 against $0.01 per full
  ingest, so it is cheap, but it buys nothing here.

## What actually fails (same for both models)

- **Q6 and Q7** ask in Chinese about the site's own chat: the vector store and the job-fit analysis.
  Only `aws/README.md` answers them, and it is English only. Both models return Clair's general
  study notes on pgvector, or other projects, instead. A Chinese summary of the chat backend would
  fix both, for example a short section in `clair-personal-site/README_zh.md`. It would work with
  either model.
- **Hybrid search hurts cross-language questions.** The live KB missed Q18 and Q34 (cross-language
  questions), even though the offline pure-vector run found them at rank 3 and rank 1. Keyword
  matching cannot help when the words are in another language. The sample is small (6 questions),
  and the live KB also chunks with its own tokenizer, so test it before changing anything. The setting is `overrideSearchType` in `tools/handler.py`.
  An A/B test over this question set would cost almost nothing.

## Re-run

```bash
aws s3 sync s3://<docs-bucket>/knowledge/ <docs-dir>/    # bucket name: see the data stack
python embedding_eval.py --docs <docs-dir> [--kb-id <knowledge-base-id>]
```

The script needs boto3, numpy, and `botocore[crt]` (for `aws login` credentials). Embeddings are
cached in `.cache/`, which is git-ignored. A full run cost under $0.10. The live-KB step wakes Aurora
from 0 ACU, which takes up to about 2 minutes, and the script retries until Aurora is up.
