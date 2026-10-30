#!/usr/bin/env bash
# Deploy (or update) the app stack: knowledge base, Lambdas, AgentCore Gateway + Runtime, Worker IAM user, budget.
# Usage: scripts/deploy_app.sh <alert-email>
set -euo pipefail
cd "$(dirname "$0")/.."
AWS="${AWS:-/c/Program Files/Amazon/AWSCLIV2/aws.exe}"
REGION=us-east-1
EMAIL="${1:?alert email}"
out() { "$AWS" cloudformation describe-stacks --region $REGION --stack-name clair-chat-data \
  --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
BUCKET=$(out BucketName)

# The agent runs on AgentCore Runtime from a zip in S3 (content-hashed name = new key when the code changes).
ZIP=$(python scripts/build_agent.py | tail -1)
KEY="artifacts/$(basename "$ZIP")"
"$AWS" s3 cp "$ZIP" "s3://$BUCKET/$KEY" --region $REGION --only-show-errors

"$AWS" cloudformation package --region $REGION --template-file infra/app.yaml \
  --s3-bucket "$BUCKET" --s3-prefix artifacts --output-template-file infra/.app.packaged.yaml >/dev/null
"$AWS" cloudformation deploy --region $REGION --stack-name clair-chat-app \
  --template-file infra/.app.packaged.yaml --capabilities CAPABILITY_NAMED_IAM --tags Project=clair-chat \
  --no-fail-on-empty-changeset --parameter-overrides BucketName="$BUCKET" \
  ClusterArn="$(out ClusterArn)" SecretArn="$(out SecretArn)" \
  CounterTableName="$(out CounterTableName)" AlertEmail="$EMAIL" AgentCodeKey="$KEY"
