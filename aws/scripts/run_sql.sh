#!/usr/bin/env bash
# Run infra/schema.sql against the Aurora cluster through the RDS Data API, one statement
# per line, retrying while the cluster resumes from 0 ACU.
set -euo pipefail
cd "$(dirname "$0")/.."
AWS="${AWS:-/c/Program Files/Amazon/AWSCLIV2/aws.exe}"
REGION=us-east-1
out() { "$AWS" cloudformation describe-stacks --region $REGION --stack-name clair-chat-data \
  --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text; }
CLUSTER=$(out ClusterArn)
SECRET=$(out SecretArn)

grep -v '^--' infra/schema.sql | grep -v '^\s*$' | while IFS= read -r sql; do
  for attempt in $(seq 1 15); do
    if "$AWS" rds-data execute-statement --region $REGION --resource-arn "$CLUSTER" \
        --secret-arn "$SECRET" --database clairchat --sql "$sql" >/dev/null 2>err.tmp; then
      echo "ok: ${sql:0:70}"; break
    fi
    grep -q "DatabaseResuming" err.tmp || { cat err.tmp; rm -f err.tmp; exit 1; }
    echo "  database resuming, retry $attempt"; sleep 5
  done
done
rm -f err.tmp
