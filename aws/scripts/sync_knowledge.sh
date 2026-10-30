#!/usr/bin/env bash
# Refresh the knowledge base now instead of waiting for the every-2-days schedule:
# regenerate the site text, upload it and knowledge-docs.json, then run the clair-chat-sync
# Lambda (it pulls GitHub, uploads what changed and starts ingestion).
# Usage: scripts/sync_knowledge.sh [path-to-site-app.js]   (default: the site's app.js, one level up)
set -euo pipefail
cd "$(dirname "$0")/.."
AWS="${AWS:-/c/Program Files/Amazon/AWSCLIV2/aws.exe}"
REGION=us-east-1
SITE_APP_JS="${1:-../app.js}"
BUCKET=$("$AWS" cloudformation describe-stacks --region $REGION --stack-name clair-chat-data \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)

node scripts/site_to_markdown.mjs "$SITE_APP_JS"
"$AWS" s3 sync knowledge/site "s3://$BUCKET/knowledge/site" --delete --region $REGION --only-show-errors
"$AWS" s3 cp knowledge-docs.json "s3://$BUCKET/config/knowledge-docs.json" --region $REGION --only-show-errors

"$AWS" lambda invoke --region $REGION --function-name clair-chat-sync --cli-read-timeout 320 \
  --cli-binary-format raw-in-base64-out --payload '{"force_ingest": true}' sync-result.json >/dev/null
python -c "import json; r=json.load(open('sync-result.json',encoding='utf8')); print(r.get('errorMessage') or f\"files {r['files']}, uploaded {len(r['uploaded'])}, deleted {len(r['deleted'])}, ingestion job {r['ingestion']}\")"
rm -f sync-result.json
