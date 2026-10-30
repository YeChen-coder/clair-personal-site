# aws/ — the backend of "Ask Clair's AI"

The chat box on this site is a small **triage agent**. Each visitor message is treated like a support
ticket and routed to one of three tools, or answered directly:

| Visitor wants... | Tool | What happens |
|---|---|---|
| to know about Clair's projects, skills, experience | `search_clair_kb` | RAG over Clair's public GitHub docs and this site's text |
| to see Clair's cats | `get_cat_photo` | a photo of Chichi or Tabo, served from a private S3 bucket through a short-lived link |
| to contact Clair | `leave_message` | a ticket (`T-XXXXXXXX`) is stored and Clair gets an email |
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
  100 database wake-ups.
- **Per answer**: at most 4 model calls of at most 700 output tokens each. A knowledge question costs
  about 5k input tokens on Claude Haiku 4.5.
- **Idle cost**: Aurora scales to 0 ACU after 5 idle minutes. Runtime, Gateway and Lambda bill per
  use. Logs and spans are kept 14 days (a few KB per question; CloudWatch Logs bills per GB).
- **Access**: the Lambda function URL, the Runtime and the Gateway all require IAM (SigV4); unsigned
  calls get 401/403. Each role allows only what its layer does (e.g. the agent may call this one
  Gateway, the model and its counter, but cannot touch the knowledge base, Aurora or the messages). The S3 bucket blocks all public access; photos are
  shared only by 15-minute presigned links.
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
| `tools/handler.py` | The three tools, called through the Gateway |
| `lambda/handler.py` | `/warm`, plus the fallback all-in-one agent (its tool code duplicates `tools/`) |
| `sync/handler.py` | Knowledge sync, every 2 days |
| `knowledge-docs.json` | Extra files the sync pulls beyond root READMEs |
| `cats/` | `cats.json` + photos (kept out of git; see `cats.example.json`) |
| `scripts/` | Deploy, build the agent zip, knowledge sync, cat upload, schema, site text export |

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
