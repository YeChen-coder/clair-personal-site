"""clair-chat-tools: the three tools behind the AgentCore Gateway.

The Gateway calls this function once per MCP tools/call. The event is the tool's arguments; the tool
name arrives in the context as "<target>___<tool>". The return value is JSON that the agent splits into
what the model reads ("text") and what goes straight to the chat window (sources, image, ticket).
"""

from __future__ import annotations

import json
import os
import random
import time
import uuid
from datetime import datetime, timedelta, timezone

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError

KB_ID = os.environ["KB_ID"]
CLUSTER_ARN = os.environ["CLUSTER_ARN"]
SECRET_ARN = os.environ["SECRET_ARN"]
DB_NAME = os.environ["DB_NAME"]
COUNTER_TABLE = os.environ["COUNTER_TABLE"]
BUCKET = os.environ["BUCKET"]
MESSAGES_TABLE = os.environ["MESSAGES_TABLE"]
TOPIC_ARN = os.environ["TOPIC_ARN"]
MESSAGE_DAILY_LIMIT = int(os.environ.get("MESSAGE_DAILY_LIMIT", "10"))
GITHUB = "https://github.com/YeChen-coder/"
SITE = "https://clair-chen.yechenworking.workers.dev/"

agent = boto3.client("bedrock-agent-runtime")
rds = boto3.client("rds-data")
ddb = boto3.client("dynamodb")
s3 = boto3.client("s3", config=Config(signature_version="s3v4"))
sns = boto3.client("sns")


class Waking(Exception):
    """The database is still resuming."""


def lambda_handler(event, context):
    full = context.client_context.custom["bedrockAgentCoreToolName"]
    name = full.split("___", 1)[-1]
    args = event if isinstance(event, dict) else {}
    print(json.dumps({"event": "tool", "tool": name}))
    try:
        if name == "search_clair_kb":
            return search(str(args.get("query", "")))
        if name == "get_cat_photo":
            return cat(str(args.get("cat", "")))
        if name == "leave_message":
            return message(args)
        return {"text": f"Unknown tool {name}.", "error": True}
    except Waking:
        return {"text": "The knowledge base is still waking up.", "waking": True}
    except ClientError as exc:
        # The model gets a neutral failure; details go to CloudWatch.
        print(json.dumps({"event": "tool_error", "tool": name, "code": exc.response["Error"]["Code"],
                          "message": str(exc)[:300]}))
        return {"text": "The tool failed. Tell the visitor to try again later.", "error": True}


# ---------- search_clair_kb ----------

def search(query: str) -> dict:
    if not query.strip():
        return {"text": "Empty query."}
    if wake(wait_seconds=40) != "awake":
        raise Waking
    chunks = retrieve(query)
    sources, seen = [], set()
    for c in chunks:
        if c["url"] not in seen:
            seen.add(c["url"])
            sources.append({"title": c["title"], "url": c["url"]})
    if not chunks:
        return {"text": "No matching material."}
    text = "\n\n".join(f'<doc source="{c["title"]}">\n{c["text"]}\n</doc>' for c in chunks)
    return {"text": text, "sources": sources}


def wake(wait_seconds: float) -> str:
    """Run a trivial query; while the cluster resumes from 0 ACU the Data API refuses it."""
    deadline = time.monotonic() + wait_seconds
    while True:
        try:
            rds.execute_statement(resourceArn=CLUSTER_ARN, secretArn=SECRET_ARN, database=DB_NAME, sql="SELECT 1")
            return "awake"
        except ClientError as exc:
            code = exc.response["Error"]["Code"]
            if code not in ("DatabaseResumingException", "DatabaseNotFoundException", "ServiceUnavailableError",
                            "StatementTimeoutException", "InternalServerErrorException"):
                raise
            if time.monotonic() >= deadline:
                return "waking"
            time.sleep(3)


def retrieve(query: str) -> list[dict]:
    for attempt in range(3):
        try:
            res = agent.retrieve(
                knowledgeBaseId=KB_ID,
                retrievalQuery={"text": query[:1000]},
                retrievalConfiguration={"vectorSearchConfiguration": {
                    "numberOfResults": 6, "overrideSearchType": "HYBRID"}},
            )
            break
        except ClientError as exc:
            # The cluster can still be finishing its resume when Bedrock connects.
            if attempt == 2 or exc.response["Error"]["Code"] in ("AccessDeniedException",):
                raise
            time.sleep(4)
    chunks = []
    for r in res.get("retrievalResults", []):
        uri = r.get("location", {}).get("s3Location", {}).get("uri", "")
        title, url = describe_source(uri)
        chunks.append({"text": r["content"]["text"][:2500], "title": title, "url": url})
    return chunks


def describe_source(uri: str) -> tuple[str, str]:
    """github/<Repo>__README*.md -> the repo; docs/<Repo>__<path with ~> -> that file; site/... -> the website."""
    name = uri.rsplit("/", 1)[-1]
    if "/github/" in uri and "__" in name:
        repo = name.split("__", 1)[0]
        return repo, GITHUB + repo
    if "/docs/" in uri and "__" in name:
        repo, path = name.split("__", 1)
        path = path.replace("~", "/")
        return f"{repo} · {path.rsplit('/', 1)[-1]}", f"{GITHUB}{repo}/blob/HEAD/{path}"
    return "Clair's website", SITE


# ---------- get_cat_photo ----------

_cats_cache = {"at": -1e9, "items": []}


def load_cats() -> list[dict]:
    """cats/cats.json in the docs bucket: [{"name": str, "file": str, "about": str}, ...]."""
    if time.monotonic() - _cats_cache["at"] < 300:
        return _cats_cache["items"]
    try:
        raw = s3.get_object(Bucket=BUCKET, Key="cats/cats.json")["Body"].read()
        items = [c for c in json.loads(raw) if isinstance(c, dict) and c.get("name") and c.get("file")]
    except (ClientError, ValueError):
        # A missing key shows up as AccessDenied here (no ListBucket), so any failure means "no photos".
        items = []
    _cats_cache.update(at=time.monotonic(), items=items)
    return items


def cat(wanted: str) -> dict:
    cats = load_cats()
    if not cats:
        return {"text": "There are no cat photos uploaded yet. Say so and promise some soon."}
    wanted = wanted.strip().lower()
    pool = [c for c in cats if wanted and wanted in c["name"].lower()] or cats
    pick = random.choice(pool)
    url = s3.generate_presigned_url(
        "get_object", Params={"Bucket": BUCKET, "Key": f"cats/{pick['file']}"}, ExpiresIn=900)
    return {"text": f"Showing {pick['name']}. About: {pick.get('about', '')}", "image": {"url": url}}


# ---------- leave_message ----------

def message(args: dict) -> dict:
    text = str(args.get("message", "")).strip()[:1000]
    if len(text) < 5:
        return {"text": "The message is empty. Ask the visitor what they want to tell Clair."}
    if not bump("msg", MESSAGE_DAILY_LIMIT):
        return {"text": "Today's message quota is used up. Suggest Clair's GitHub (https://github.com/YeChen-coder)."}
    contact = str(args.get("contact", "")).strip()[:200]
    name = str(args.get("name", "")).strip()[:100]
    ticket = "T-" + uuid.uuid4().hex[:8].upper()
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    ddb.put_item(TableName=MESSAGES_TABLE, Item={
        "pk": {"S": ticket}, "created": {"S": now}, "status": {"S": "new"}, "message": {"S": text},
        "contact": {"S": contact or "-"}, "name": {"S": name or "-"},
    })
    try:
        sns.publish(TopicArn=TOPIC_ARN, Subject=f"[Clair site] New message {ticket}",
                    Message=f"{ticket}  {now}\nFrom: {name or '-'}\nContact: {contact or '-'}\n\n{text}\n")
    except ClientError as exc:
        # The ticket is already stored, so the visitor's message is not lost.
        print(json.dumps({"event": "notify_error", "ticket": ticket, "message": str(exc)[:300]}))
    return {"text": f"Saved as ticket {ticket}. Clair has been notified.", "ticket": ticket}


def bump(kind: str, limit: int) -> bool:
    """Atomic per-day counter; False once `limit` has been used today (UTC)."""
    now = datetime.now(timezone.utc)
    try:
        ddb.update_item(
            TableName=COUNTER_TABLE,
            Key={"pk": {"S": f"{kind}#{now:%Y-%m-%d}"}},
            UpdateExpression="ADD n :one SET expires = :exp",
            ConditionExpression="attribute_not_exists(n) OR n < :limit",
            ExpressionAttributeValues={
                ":one": {"N": "1"}, ":limit": {"N": str(limit)},
                ":exp": {"N": str(int((now + timedelta(days=3)).timestamp()))},
            },
        )
        return True
    except ClientError as exc:
        if exc.response["Error"]["Code"] == "ConditionalCheckFailedException":
            alert_once(f"{kind}#{now:%Y-%m-%d}", f"[Clair site] Daily limit reached: {kind} {limit}/{limit}",
                       f"The site used today's {limit} '{kind}' (UTC day {now:%Y-%m-%d}). "
                       "Visitors are told to try tomorrow or use GitHub; it resets at 00:00 UTC.")
            return False
        raise


def alert_once(key: str, subject: str, body: str) -> None:
    """Email Clair (the visitor-message SNS topic) the first time `key` happens; later calls are silent."""
    try:
        ddb.update_item(
            TableName=COUNTER_TABLE, Key={"pk": {"S": f"alert#{key}"}},
            UpdateExpression="SET expires = :exp", ConditionExpression="attribute_not_exists(pk)",
            ExpressionAttributeValues={":exp": {"N": str(int(time.time()) + 15 * 86400)}})
        sns.publish(TopicArn=TOPIC_ARN, Subject=subject[:100], Message=body)
    except ClientError as exc:
        if exc.response["Error"]["Code"] != "ConditionalCheckFailedException":
            print(json.dumps({"event": "alert_error", "key": key, "message": str(exc)[:300]}))
