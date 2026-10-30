#!/usr/bin/env bash
# Upload cats/ (photos + cats.json) to the docs bucket under cats/. Lambda reads it within 5 minutes.
# cats.json: [{"name": "Mochi", "file": "mochi-1.jpg", "about": "one or two lines the bot may paraphrase"}]
# A cat can have several entries (one per photo). Photos: JPEG/PNG/WebP, resize to ~1600px first.
set -euo pipefail
cd "$(dirname "$0")/.."
AWS="${AWS:-/c/Program Files/Amazon/AWSCLIV2/aws.exe}"
BUCKET=$("$AWS" cloudformation describe-stacks --region us-east-1 --stack-name clair-chat-data \
  --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
"$AWS" s3 sync cats "s3://$BUCKET/cats" --region us-east-1 --delete --exclude "*.md"
