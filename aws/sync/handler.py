"""clair-chat-sync: every two days, mirror Clair's public GitHub docs into the knowledge base.

  knowledge/github/<Repo>__README*.md  root READMEs (en and zh) of every public, non-fork repo
  knowledge/docs/<Repo>__<path, / as ~>  files listed in config/knowledge-docs.json, plus every
                                         .md file of its "whole_repos" (minus their excludes)

Only files whose content changed are uploaded (compared with the S3 ETag, which is the MD5 of a
single-part upload); files that left GitHub or the manifest are deleted. If anything changed, or
the event says {"force_ingest": true}, Aurora is woken and an ingestion job starts, which
re-embeds only the changed documents. knowledge/site/ is written by scripts/sync_knowledge.sh
and left alone here. Only public repos are read: the GitHub API is called without a token.
"""

from __future__ import annotations

import hashlib
import json
import os
import time
import urllib.request
from urllib.parse import quote

import boto3
from botocore.exceptions import ClientError

USER = "YeChen-coder"
BUCKET = os.environ["BUCKET"]
KB_ID = os.environ["KB_ID"]
DS_ID = os.environ["DS_ID"]
CLUSTER_ARN = os.environ["CLUSTER_ARN"]
SECRET_ARN = os.environ["SECRET_ARN"]
DB_NAME = os.environ["DB_NAME"]
MANAGED = ("knowledge/github/", "knowledge/docs/")

s3 = boto3.client("s3")
agent = boto3.client("bedrock-agent")
rds = boto3.client("rds-data")


def lambda_handler(event, context):
    wanted = wanted_files()
    existing = existing_etags()
    uploaded, deleted = [], []
    for key, (repo, branch, path) in wanted.items():
        body = fetch_raw(repo, branch, path)
        if existing.get(key) != hashlib.md5(body).hexdigest():
            s3.put_object(Bucket=BUCKET, Key=key, Body=body, ContentType="text/markdown; charset=utf-8")
            uploaded.append(key)
    for key in existing.keys() - wanted.keys():
        s3.delete_object(Bucket=BUCKET, Key=key)
        deleted.append(key)

    job = None
    if uploaded or deleted or (event or {}).get("force_ingest"):
        job = start_ingestion()
    summary = {"event": "sync", "files": len(wanted), "uploaded": uploaded, "deleted": deleted, "ingestion": job}
    print(json.dumps(summary, ensure_ascii=False))
    return summary


def wanted_files() -> dict[str, tuple[str, str, str]]:
    """S3 key -> (repo, branch, path) for everything that should be in the knowledge base."""
    manifest = json.loads(s3.get_object(Bucket=BUCKET, Key="config/knowledge-docs.json")["Body"].read())
    branches = {r["name"]: r["default_branch"]
                for r in github(f"users/{USER}/repos?per_page=100") if not r["fork"]}
    files = {}
    for repo, branch in branches.items():
        for item in github(f"repos/{USER}/{repo}/contents/"):
            name = item["name"]
            if item["type"] == "file" and is_readme(name):
                files[f"knowledge/github/{repo}__{name}"] = (repo, branch, name)
    for repo, paths in manifest.get("repos", {}).items():
        if repo in branches:
            for path in paths:
                files[doc_key(repo, path)] = (repo, branches[repo], path)
    for repo, opts in manifest.get("whole_repos", {}).items():
        if repo not in branches:
            continue
        skip = set(opts.get("exclude", []))
        tree = github(f"repos/{USER}/{repo}/git/trees/{quote(branches[repo])}?recursive=1")["tree"]
        for node in tree:
            path = node["path"]
            if (node["type"] == "blob" and path.lower().endswith(".md") and path not in skip
                    and not ("/" not in path and is_readme(path))):
                files[doc_key(repo, path)] = (repo, branches[repo], path)
    return files


def is_readme(name: str) -> bool:
    return name.lower().startswith("readme") and name.lower().endswith(".md")


def doc_key(repo: str, path: str) -> str:
    return f"knowledge/docs/{repo}__{path.replace('/', '~')}"


def existing_etags() -> dict[str, str]:
    etags = {}
    for prefix in MANAGED:
        for page in s3.get_paginator("list_objects_v2").paginate(Bucket=BUCKET, Prefix=prefix):
            for obj in page.get("Contents", []):
                etags[obj["Key"]] = obj["ETag"].strip('"')
    return etags


def github(path: str):
    req = urllib.request.Request(f"https://api.github.com/{path}", headers={
        "Accept": "application/vnd.github+json", "User-Agent": "clair-chat-sync"})
    with urllib.request.urlopen(req, timeout=20) as res:
        return json.load(res)


def fetch_raw(repo: str, branch: str, path: str) -> bytes:
    url = f"https://raw.githubusercontent.com/{USER}/{repo}/{quote(branch)}/{quote(path)}"
    with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "clair-chat-sync"}),
                                timeout=20) as res:
        return res.read()


def start_ingestion() -> str | None:
    """Wake the paused cluster, then start the job; None if one is already running."""
    deadline = time.monotonic() + 120
    while True:
        try:
            rds.execute_statement(resourceArn=CLUSTER_ARN, secretArn=SECRET_ARN, database=DB_NAME, sql="SELECT 1")
            break
        except ClientError as exc:
            if exc.response["Error"]["Code"] != "DatabaseResumingException" or time.monotonic() > deadline:
                raise
            time.sleep(5)
    for _ in range(6):
        try:
            job = agent.start_ingestion_job(knowledgeBaseId=KB_ID, dataSourceId=DS_ID)
            return job["ingestionJob"]["ingestionJobId"]
        except ClientError as exc:
            if exc.response["Error"]["Code"] == "ConflictException":
                return None
            if "resum" not in str(exc).lower() and "paused" not in str(exc).lower():
                raise
            time.sleep(10)
    raise RuntimeError("database did not resume in time")
