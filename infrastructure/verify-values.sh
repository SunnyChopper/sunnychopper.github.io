#!/bin/bash
# Script to verify Terraform variable values before applying
# Usage: ./verify-values.sh

echo "=== Terraform Variable Verification ==="
echo ""

if [ ! -f "terraform.tfvars" ]; then
  echo "❌ terraform.tfvars not found!"
  echo "   Copy terraform.tfvars.example to terraform.tfvars and fill in your values"
  exit 1
fi

echo "Reading values from terraform.tfvars:"
echo ""

# Extract values (simple grep, assumes format: key = "value")
echo "📋 AWS Region:"
grep -E "^aws_region\s*=" terraform.tfvars | sed 's/.*= *"\(.*\)"/  \1/' || echo "  (not set, using default)"

echo ""
echo "📋 API Base URL:"
grep -E "^api_base_url\s*=" terraform.tfvars | sed 's/.*= *"\(.*\)"/  \1/' || echo "  (not set, using default)"

echo ""
echo "📋 Cognito User Pool ID:"
POOL_ID=$(grep -E "^cognito_user_pool_id\s*=" terraform.tfvars | sed 's/.*= *"\(.*\)"/\1/')
if [ -n "$POOL_ID" ]; then
  echo "  ${POOL_ID:0:8}...${POOL_ID: -4}"
else
  echo "  (not set)"
fi

echo ""
echo "📋 Cognito Client ID:"
CLIENT_ID=$(grep -E "^cognito_client_id\s*=" terraform.tfvars | sed 's/.*= *"\(.*\)"/\1/')
if [ -n "$CLIENT_ID" ]; then
  echo "  ${CLIENT_ID:0:8}...${CLIENT_ID: -4}"
else
  echo "  (not set)"
fi

echo ""
echo "📋 Cognito Identity Pool ID:"
IDENTITY_POOL_ID=$(grep -E "^cognito_identity_pool_id\s*=" terraform.tfvars | sed 's/.*= *"\(.*\)"/\1/')
if [ -n "$IDENTITY_POOL_ID" ]; then
  echo "  ${IDENTITY_POOL_ID:0:8}...${IDENTITY_POOL_ID: -4}"
else
  echo "  (not set, optional)"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "To see full values in Terraform plan, use:"
echo "  terraform console"
echo "Then type: var.cognito_user_pool_id (or any variable name)"
