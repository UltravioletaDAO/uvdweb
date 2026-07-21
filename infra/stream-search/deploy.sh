#!/usr/bin/env bash
# Deploy the stream-search Lambda (us-east-1, same region as the ultravioletadao bucket).
# Idempotent-ish: create-* calls fail harmlessly if the resource exists; use update paths below.
set -euo pipefail

REGION=us-east-1
FN=uvd-stream-search
ROLE=uvd-stream-search-lambda
BUCKET=ultravioletadao
KEY=stream-search/search.db
HERE="$(cd "$(dirname "$0")" && pwd)"

# 1) IAM role (basic logs + read the index object)
aws iam create-role --role-name "$ROLE" --assume-role-policy-document '{
  "Version":"2012-10-17",
  "Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]
}' 2>/dev/null || true
aws iam attach-role-policy --role-name "$ROLE" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
aws iam put-role-policy --role-name "$ROLE" --policy-name s3-read-index --policy-document '{
  "Version":"2012-10-17",
  "Statement":[{"Effect":"Allow","Action":"s3:GetObject","Resource":"arn:aws:s3:::'"$BUCKET"'/stream-search/*"}]
}'

# 2) Function code
cd "$HERE" && rm -f fn.zip && zip -q fn.zip lambda_function.py
ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
aws lambda create-function --region "$REGION" --function-name "$FN" \
  --runtime python3.12 --handler lambda_function.handler \
  --role "arn:aws:iam::${ACCOUNT}:role/${ROLE}" \
  --zip-file fileb://fn.zip --memory-size 1024 --timeout 30 \
  --environment "Variables={INDEX_BUCKET=$BUCKET,INDEX_KEY=$KEY}" \
  2>/dev/null || aws lambda update-function-code --region "$REGION" \
  --function-name "$FN" --zip-file fileb://fn.zip

# 3) Public endpoint: API Gateway HTTP API (Function URLs return 403 in this
#    account even with a correct public resource policy - likely a public-access
#    block at account level - so we front the Lambda with API GW instead).
#    Live endpoint (2026-07-21): https://pbs5xr8wye.execute-api.us-east-1.amazonaws.com
API_ID=$(aws apigatewayv2 get-apis --region "$REGION" \
  --query "Items[?Name=='$FN'].ApiId | [0]" --output text)
if [ "$API_ID" = "None" ] || [ -z "$API_ID" ]; then
  API_ID=$(aws apigatewayv2 create-api --region "$REGION" --name "$FN" \
    --protocol-type HTTP \
    --target "arn:aws:lambda:${REGION}:${ACCOUNT}:function:${FN}" \
    --cors-configuration "AllowOrigins=https://ultravioletadao.xyz,https://dev.ultravioletadao.xyz,http://localhost:3000,AllowMethods=GET" \
    --query ApiId --output text)
  aws lambda add-permission --region "$REGION" --function-name "$FN" \
    --statement-id apigw-invoke --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT}:${API_ID}/*"
fi
echo "https://${API_ID}.execute-api.${REGION}.amazonaws.com"
