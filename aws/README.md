# aws/ — the backend of "Ask Clair's AI"

The chat box on this site is a small **triage agent**. Each visitor message is treated like a support
ticket and routed to one of four tools, or answered directly:

| Visitor wants... | Tool | What happens |
|---|---|---|
| to know about Clair's projects, skills, experience | `search_clair_kb` | RAG over Clair's public GitHub docs and this site's text |
| to see Clair's cats | `get_cat_photo` | a photo of Chichi or Tabo, served from a private S3 bucket through a short-lived link |
| to contact Clair | `leave_message` | a ticket (`T-XXXXXXXX`) is stored and Clair gets an email |
| to check Clair against a job description they pasted | `analyze_job_fit` | a multi-agent workflow writes a checked fit report ([below](#job-fit-analysis-a-multi-agent-workflow)) |
| anything else | (none) | greetings are answered, off-topic requests politely declined |

Everything is AWS, deployed with CloudFormation, in `us-east-1`.

## How a message travels

```
browser (chat.js)
  │  POST /api/chat
  ▼
Cloudflare Worker (worker.js)                       per-IP rate limit, origin check, SigV4 signing
  │  InvokeAgentRuntime (IAM)
  ▼
Amazon Bedrock AgentCore Runtime                    hosts agent/main.py, one session per visitor
  │  agent loop: Bedrock Converse + Claude Haiku 4.5 decides which tool to call (tool use)
  │  MCP tools/list + tools/call (IAM)
  ▼
Amazon Bedrock AgentCore Gateway                    turns a Lambda into MCP tools
  │  lambda:Invoke
  ▼
Lambda clair-chat-tools (tools/handler.py)
  ├─ search_clair_kb → Bedrock Knowledge Base (hybrid search)
  │                     └─ Aurora PostgreSQL Serverless v2 + pgvector (pauses at 0 ACU when idle)
  ├─ get_cat_photo   → S3 presigned URL
  └─ leave_message   → DynamoDB ticket + SNS email
```

When the chat opens, `/api/warm` calls a separate Lambda (`lambda/handler.py`) that starts waking the
database, so the first answer is faster. The same Lambda still contains an all-in-one version of
the agent (tools called in-process, no AgentCore). It is the fallback: setting the Worker variable
`CHAT_BACKEND` to `lambda` routes chats there instead.

### The layers

- **Cloudflare Worker**: the only public entry. Rate limits per IP (6 chats and 3 wake-ups per
  minute), rejects other origins and large bodies, and signs requests to AWS with an IAM user that
  may only invoke the chat. The visitor never talks to AWS directly.
- **AgentCore Runtime**: serverless hosting for the agent. The code is a zip in S3 (direct code
  deployment, Python 3.13, arm64). The agent is a plain HTTP server with `GET /ping` and
  `POST /invocations` on port 8080; no agent framework. Sessions end after 5 idle minutes.
- **The agent** (`agent/main.py`): checks the daily cap, discovers its tools from the Gateway, then
  loops up to 4 times: ask Claude what to do, run the tool it picked, feed the result back.
  The system prompt holds the triage rules. Tool results are split: the model reads the text, while
  sources, the photo link and the ticket number go straight to the chat window, so the model cannot
  alter them.
- **AgentCore Gateway**: exposes `tools/handler.py` as MCP tools from an inline tool schema. The
  agent only knows the Gateway URL; adding a tool means adding a schema entry and a branch in the
  Lambda, not changing the agent.
- **Tools Lambda**: the three tools. The knowledge search wakes Aurora only when it is needed.
- **Knowledge base**: Bedrock Knowledge Bases with Titan embeddings, stored in Aurora pgvector.
  `sync/handler.py` runs every 2 days: it mirrors the root READMEs of all public repos plus the files
  listed in `knowledge-docs.json` into S3 and re-ingests only what changed.

## Job-fit analysis: a multi-agent workflow

When a visitor pastes a job description, the triage agent hands it to `agent/job_fit.py`. This is the
one tool that runs inside the agent instead of behind the Gateway, because it is itself a small
orchestration of model calls that use the Gateway's knowledge search:

```
triage agent ── analyze_job_fit ──▶ 1. extract    the requirements (≤ 12), as structured output
                                    2. research   per requirement, in parallel threads:
                                                  search_clair_kb via the Gateway, then a grader
                                                  call: strong / partial / none + one line of evidence
                                    3. write      the report from the grades only
                                    4. verify     a checker call compares report and grades; one
                                                  rewrite, else a report built from the grades in code
```

- **Grounding**: the grader always sees Clair's profile (`../llms.txt`, copied into the code package
  at build time) next to the search results, so jobs and certifications count even when a search
  misses them. Rules: personal projects count fully; an adjacent technology (ECS for Kubernetes) or
  study notes alone are only partial; a feature of software Clair built is not Clair's own skill.
- **No overclaiming**: the report may only use the grades; the verifier rejects anything the evidence
  does not back, and words like "production" or "expert" are rejected in code.
- **The answer is the report**: it goes to the visitor unchanged, not through the triage model again.
- **Follow-ups see every requirement**: the reply also carries `history_text`, the numbered list from
  step 1. `chat.js` stores it in the chat history in place of the pasted job description, so later
  questions get all requirements instead of the first part of a long posting (each past turn is cut
  to 2,500 characters, `HISTORY_CHARS`).
- **Cost**: about 15 model calls and roughly $0.07 per analysis, 15 to 25 seconds; capped at 10 per day.
  Each step is a span in the trace (`job_fit`, `job_fit research`).

## What the site deliberately does not do

- **Reply to visitor messages.** A ticket ends as an email in Clair's inbox. Triage, drafting and
  follow-up of email is handled by Muse, Clair's separate personal agent that already watches that
  inbox, so this site hands off there instead of building a second approval flow.
- **Expose an MCP server to the public.** AI assistants that read the site get `llms.txt` and
  `llms-full.txt` instead (below), which every crawler can use without setup.

## For AI assistants: llms.txt

- `../llms.txt` is a hand-written, recruiter-facing profile in the [llms.txt](https://llmstxt.org)
  format. It is also the job-fit grader's profile, so redeploy the agent after editing it.
- `../llms-full.txt` and `../llms-full.zh.txt` hold every word of the site as plain text; they are
  generated from `app.js` by `node aws/scripts/build_llms.mjs` (run from the repo root, then deploy
  the site).
- `index.html` carries schema.org `Person` data (JSON-LD), and `../_headers` serves `.txt` as UTF-8.

## Observability

Every question is one trace in **AgentCore Observability** (CloudWatch console → GenAI Observability,
or the AgentCore console → Observability):

```
invoke_agent clair_chat_agent           the whole question; clair.result = answered / error code
├─ DynamoDB.UpdateItem                  daily cap
├─ chat claude-haiku-4-5                model decides (tool or answer)
├─ tool get_cat_photo                   routing decision; clair.tool, clair.tool.status
│  └─ POST                              MCP tools/call to the Gateway
└─ chat claude-haiku-4-5                model writes the reply
```

- The agent uses ADOT (AWS Distro for OpenTelemetry), started from `main.py` with `initialize()`;
  Bedrock, DynamoDB and HTTP calls are traced automatically, the tool spans are added by hand.
- Spans land in the agent's own log group (stream `spans`); the Gateway sends its logs to
  `/aws/vendedlogs/bedrock-agentcore/gateway/...` and its traces, like the Runtime's service spans,
  to X-Ray. CloudWatch Transaction Search (account-wide) stores spans as logs and indexes 1%.
- Visitor messages appear in spans and logs. They stay in this account and expire after 14 days.

## Cost and safety guards

- **Budget**: $10/month for the whole account. Emails at 50% and 80%. At 100%, a budget action
  attaches a deny policy (Bedrock, AgentCore, Lambda invoke, RDS Data API) to every role here and to
  the Worker's IAM user. Billing data lags by hours, so this is the last line, not the first.
- **Daily caps** (DynamoDB counters, UTC day): 80 answered questions, 10 visitor messages,
  10 job-fit analyses, 100 database wake-ups.
- **Per answer**: at most 4 model calls of at most 700 output tokens each. A knowledge question costs
  about 5k input tokens on Claude Haiku 4.5; a job-fit analysis about 45k (roughly $0.06).
- **Idle cost**: Aurora scales to 0 ACU after 5 idle minutes. Runtime, Gateway and Lambda bill per
  use. Logs and spans are kept 14 days (a few KB per question; CloudWatch Logs bills per GB).
- **Access**: the Lambda function URL, the Runtime and the Gateway all require IAM (SigV4); unsigned
  calls get 401/403. Each role allows only what its layer does (e.g. the agent may call this one
  Gateway, the model and its counter, but cannot touch the knowledge base, Aurora or the messages).
  The S3 bucket blocks all public access; photos are shared only by 15-minute presigned links.
- **Prompt injection**: visitor text and tool results are marked as data in the prompt. A tool can
  only do what its Lambda allows: search, show a cat, or file one message per request within the
  daily cap.

## Layout

| Path | What |
|---|---|
| `infra/data.yaml` | Stack `clair-chat-data`: S3 bucket, Aurora cluster, DynamoDB counter |
| `infra/schema.sql` | pgvector table Bedrock expects (`scripts/run_sql.sh`) |
| `infra/app.yaml` | Stack `clair-chat-app`: knowledge base, Lambdas, AgentCore Gateway + target + Runtime, messages table, SNS, Worker IAM user, budget |
| `agent/main.py` | The agent hosted on AgentCore Runtime |
| `agent/job_fit.py` | The job-fit workflow (extract, research in parallel, write, verify) |
| `tools/handler.py` | The three tools, called through the Gateway |
| `lambda/handler.py` | `/warm`, plus the fallback all-in-one agent (its tool code duplicates `tools/`) |
| `sync/handler.py` | Knowledge sync, every 2 days |
| `knowledge-docs.json` | Extra files the sync pulls beyond root READMEs |
| `cats/` | `cats.json` + photos (kept out of git; see `cats.example.json`) |
| `scripts/` | Deploy, build the agent zip, knowledge sync, cat upload, schema, site text export, `build_llms.mjs` |

## Common tasks

Run from Git Bash in this folder. Scripts look up bucket names and ARNs from the CloudFormation
stacks, so nothing account-specific is stored in the repo.

```bash
bash scripts/deploy_app.sh <alert-email>   # after changing infra/, agent/, tools/, lambda/ or sync/
bash scripts/sync_knowledge.sh             # refresh the knowledge base now
bash scripts/upload_cats.sh                # after adding photos to cats/ and cats/cats.json
```

The Worker needs two secrets besides its AWS keys: `CHAT_FUNCTION_URL` (stack output
`FunctionUrl`) and `AGENT_RUNTIME_ARN` (stack output `AgentRuntimeArn`). See `../DEPLOY.md`.

## Tear down

Delete stack `clair-chat-app`, empty the bucket `clair-chat-docs-<account-id>`, then delete stack
`clair-chat-data`. The messages table `clair-chat-messages` is retained on purpose; delete it by hand
if wanted. Remove the Worker user's access key first if the app stack refuses to delete the user.
