"""Regression check for the job-fit report: facts that must not be misattributed.

Usage (from aws/, after `python scripts/build_agent.py` so boto3 is in .build/agent):
  PYTHONPATH=.build/agent python scripts/check_job_fit.py            # local: workflow on this machine
  PYTHONPATH=.build/agent python scripts/check_job_fit.py --deployed # the deployed agent, new session
  ... --only 1,3   run some job descriptions only;   --out FILE   save reports and grades as JSON

Local mode runs agent/job_fit.py here with the real model and knowledge base (the search is the
tools Lambda's own code), so every grade can be inspected; it does not touch the daily counters.
Deployed mode calls AgentCore Runtime with a fresh session id and uses the shared daily caps
(1 chat + 1 job-fit per description): reset them afterwards (see aws/README.md).
Account values are read from the CloudFormation stacks, never written here.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import os
import re
import sys
import uuid
from pathlib import Path

import boto3

ROOT = Path(__file__).resolve().parent.parent
REGION = "us-east-1"
MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0"

JDS = [
    {"name": "AWS GenAI engineer (API Gateway, vector search, LLM evaluation)", "text": """\
AI Engineer, Generative AI Platform. We are building LLM-powered products on AWS.
Requirements: 3+ years of Python. Build serverless backends with AWS Lambda and Amazon API Gateway.
Design retrieval-augmented generation (RAG) pipelines with vector databases such as pgvector, \
OpenSearch or Pinecone, including hybrid search and reranking. Evaluate LLM and retrieval quality \
with offline metrics (hit rate, recall@k) and run A/B experiments. Build agents with tool calling \
and the Model Context Protocol (MCP). Infrastructure as code (CloudFormation or Terraform). \
Observability with OpenTelemetry and CloudWatch. Nice to have: AWS certifications, experience \
with realtime voice, Kubernetes."""},
    {"name": "RAG / search engineer", "text": """\
Machine Learning Engineer, Search and Retrieval. You will own our semantic search stack.
- Build and tune embedding-based retrieval on PostgreSQL with pgvector and on Elasticsearch.
- Hybrid search (BM25 + dense vectors), query rewriting, rerankers such as Cohere or Voyage.
- Design evaluation sets and measure retrieval (hit@k, MRR, nDCG) and answer faithfulness.
- Chunking strategies for long documents, metadata filtering, ingestion pipelines.
- Python, FastAPI, Docker. Deploy on AWS (ECS, Lambda) behind API Gateway.
- Bonus: LLM guardrails, prompt injection defenses, LangChain or LlamaIndex."""},
    {"name": "Agent platform engineer", "text": """\
Senior AI Agent Engineer. Join the team building our agent platform.
You will: design multi-agent workflows (planner, researcher, verifier) on top of LLM APIs; expose \
internal services to agents as tools through an API gateway and MCP servers; build guardrails that \
stop hallucinated claims; add tracing and cost controls (budgets, rate limits); ship on AWS with \
Bedrock, Lambda, DynamoDB and Step Functions. Required: Python, TypeScript, REST API design, \
experience with Amazon API Gateway and IAM authorization. Preferred: speech/voice AI, PyTorch model \
training, customer-facing technical support experience."""},
    {"name": "Chinese LLM application engineer (zh report)", "text": """\
岗位：大模型应用工程师（RAG 方向）
职责：
1. 负责基于大模型的知识库问答系统，设计文档切分、向量化和检索流程，使用 PostgreSQL + pgvector 或 Milvus 存储向量；
2. 实现混合检索（BM25 + 向量）与重排序，并建立评测集，用 hit@k、MRR 等指标持续评估检索效果；
3. 在 AWS 上用 Lambda、API Gateway 部署服务，接入 Amazon Bedrock；
4. 设计多智能体（Agent）工作流与工具调用，降低幻觉。
要求：熟练使用 Python；有语音交互或实时语音项目经验者优先；有 AWS 认证者优先。"""},
]

# Each check: (description, function(text) -> True when the text is WRONG, hard failure?). Applied to the
# claim part of every report line and, in local mode, to every checked fact ("claim (project)").
NEG = r"(no|not|without|gaps?|missing|lacks?|rather than|instead of|isn't|is not|没有|不是|并非|缺少)"


def _api_gateway(text: str) -> bool:
    # Amazon API Gateway claimed as Clair's: only AniMatch used it. "AgentCore Gateway" and a stated gap
    # ("no API Gateway evidence") are fine.
    if "AniMatch" in text or text.lstrip().startswith(("Gaps", "差距", "✗")):
        return False
    for m in re.finditer(r"API[ -]?Gateway|API 网关", text, re.I):
        near = text[max(0, m.start() - 40):m.end() + 25]
        if not re.search(NEG, near, re.I) and "AgentCore" not in text[max(0, m.start() - 12):m.start()]:
            return True
    return False


def _step_functions(text: str) -> bool:
    return bool(re.search(r"Step Functions", text)) and not re.search(NEG, text, re.I)


def _pgvector_jesus(text: str) -> bool:
    # JesusSaysHi never used pgvector (phase 1: numpy, phase 4: RAGFlow); Ask Clair's AI does.
    for m in re.finditer(r"pgvector[^.;；。]{0,60}?JesusSaysHi|JesusSaysHi[^.;；。]{0,40}?pgvector", text, re.I):
        after = text[m.end():m.end() + 15]
        if not re.search(r"RAGFlow|Infinity|" + NEG, m.group(0) + after, re.I):
            return True
    return False


def _swapped_hit3(text: str) -> bool:
    # JesusSaysHi eval/ragflow_results.md: hybrid + rewrite 91-93% hit@3, dense + rewrite 87%.
    n9, n87 = re.search(r"9[13]\s*%", text), re.search(r"87\s*%", text)
    hy, de = re.search(r"hybrid|混合", text, re.I), re.search(r"dense|密集|稠密", text, re.I)
    if n9 and n87 and hy and de:  # "hybrid vs dense (91-93% vs 87%)": the two orders must agree
        return (n9.start() < n87.start()) != (hy.start() < de.start())
    return bool(re.search(r"9[13]\s*%\s*(for |with |on )?(dense|密集)|(dense|密集)[^,;，；。]{0,20}?(:|=|at|of|scored|"
                          r"reached|达|为)\s*9[13]|87\s*%\s*(for |with |on )?(hybrid|混合)|(hybrid|混合)[^,;，；。]{0,20}?"
                          r"(:|=|at|of|scored|reached|达|为)\s*87", text, re.I))


def _bare_95(text: str) -> bool:
    return "95%" in text.replace(" %", "%") and not re.search(r"earlier|previous|first design|redesign|rerank|早期|之前|重排", text, re.I)


CHECKS = [
    ("Amazon API Gateway claimed outside AniMatch (the site uses AgentCore Gateway)", _api_gateway, True),
    ("Step Functions claimed (no project uses it)", _step_functions, True),
    ("pgvector attributed to JesusSaysHi (it uses RAGFlow)", _pgvector_jesus, True),
    ("hit@3 numbers swapped (hybrid 91-93%, dense 87%)", _swapped_hit3, True),
    ('"95% hit@3" without its configuration (warning only)', _bare_95, False),
]


def claim(line: str) -> str:
    """A report line without its requirement: "✓ Lambda and API Gateway — <claim>" -> "<claim>"."""
    if line.lstrip().startswith("✗"):  # a gap line claims nothing
        return ""
    if line.lstrip()[:1] in "✓~" and " — " in line:
        return line.split(" — ", 1)[1]
    return line


def problems_in(texts: list[str], where: str) -> list[tuple[bool, str]]:
    return [(hard, f"{where}: {desc}: {t.strip()[:200]}")
            for t in texts for desc, bad, hard in CHECKS if bad(claim(t))]


# ---------- local mode ----------

def stack_outputs(stack: str) -> dict:
    cf = boto3.client("cloudformation", region_name=REGION)
    return {o["OutputKey"]: o["OutputValue"] for o in cf.describe_stacks(StackName=stack)["Stacks"][0]["Outputs"]}


def load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_local(jd: str) -> dict:
    data, app = stack_outputs("clair-chat-data"), stack_outputs("clair-chat-app")
    os.environ.update(KB_ID=app["KnowledgeBaseId"], CLUSTER_ARN=data["ClusterArn"], SECRET_ARN=data["SecretArn"],
                      DB_NAME="clairchat", COUNTER_TABLE=data["CounterTableName"], BUCKET=data["BucketName"],
                      MESSAGES_TABLE="-", TOPIC_ARN="-", AWS_DEFAULT_REGION=REGION)
    tools = load("clair_tools", ROOT / "tools" / "handler.py")
    job_fit = load("job_fit", ROOT / "agent" / "job_fit.py")
    runtime = boto3.client("bedrock-runtime", region_name=REGION)
    calls = []

    def converse(**kwargs):
        out = runtime.converse(modelId=MODEL_ID, **kwargs)
        calls.append((out["usage"]["inputTokens"], out["usage"]["outputTokens"]))
        return out

    def search(query: str):
        payload = tools.search(query)
        if payload.get("waking"):
            raise RuntimeError("knowledge base still waking; run again")
        return payload.get("text", ""), payload.get("sources", [])

    result = job_fit.analyze(jd, converse, search, profile=(ROOT.parent / "llms.txt").read_text(encoding="utf-8"))
    tokens_in, tokens_out = sum(c[0] for c in calls), sum(c[1] for c in calls)
    result["usage"] = {"model_calls": len(calls), "input_tokens": tokens_in, "output_tokens": tokens_out,
                       "usd": round(tokens_in / 1e6 * 1.0 + tokens_out / 1e6 * 5.0, 4)}  # Haiku 4.5 prices
    return result


# ---------- deployed mode ----------

def run_deployed(jd: str) -> dict:
    arn = stack_outputs("clair-chat-app")["AgentRuntimeArn"]
    client = boto3.client("bedrock-agentcore", region_name=REGION)
    session = f"regression-{uuid.uuid4()}"  # fresh session = the newest deployed code
    res = client.invoke_agent_runtime(agentRuntimeArn=arn, runtimeSessionId=session,
                                      payload=json.dumps({"question": jd, "history": []}).encode())
    body = json.loads(res["response"].read())
    return {"report": body.get("answer") or json.dumps(body), "session": session}


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--deployed", action="store_true")
    ap.add_argument("--only", default="")
    ap.add_argument("--out", default="")
    args = ap.parse_args()
    picks = [int(i) for i in args.only.split(",") if i] or list(range(1, len(JDS) + 1))
    results, failures = [], 0
    for i in picks:
        jd = JDS[i - 1]
        result = run_deployed(jd["text"]) if args.deployed else run_local(jd["text"])
        found = problems_in(result["report"].splitlines(), "report")
        for g in result.get("grades", []):
            found += problems_in([f"{f['claim']} ({f['project']})" for f in g.get("facts", [])],
                                 f"fact [{g['requirement']}]")
        failed = any(hard for hard, _ in found)
        failures += failed
        print(f"\n=== {i}. {jd['name']}: {'FAIL' if failed else 'pass'}")
        print(result["report"])
        if result.get("grades"):
            print("--- grades")
            for g in result["grades"]:
                print(f"  {g['verdict']:7} {g['requirement']}")
                for f in g.get("facts", []):
                    print(f"            fact [{f['project']}] {f['claim']}  <=  \"{f['quote']}\"")
                for r in g.get("rejected", []):
                    print(f"            rejected: {r}")
        if result.get("meta"):
            print("--- meta", json.dumps(result["meta"]), json.dumps(result.get("usage", {})))
        for hard, p in found:
            print("  PROBLEM" if hard else "  warning", p)
        results.append({"jd": jd["name"], "problems": [p for _, p in found],
                        **{k: v for k, v in result.items() if k != "sources"}})
    if args.out:
        Path(args.out).write_text(json.dumps(results, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n{len(picks) - failures}/{len(picks)} passed")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
