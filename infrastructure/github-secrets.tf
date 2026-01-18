terraform {
  required_providers {
    github = {
      source  = "integrations/github"
      version = "~> 5.0"
    }
  }
}

# Configure GitHub provider
# Token can be provided via:
# 1. terraform.tfvars (github_token variable) - recommended
# 2. GITHUB_TOKEN environment variable (fallback - provider checks this automatically)
provider "github" {
  owner = "SunnyChopper" # Your GitHub username/organization
  # If github_token variable is set, use it; otherwise provider will use GITHUB_TOKEN env var
  token = var.github_token != "" && var.github_token != null ? var.github_token : null
}

# GitHub repository secrets managed via Terraform
# Values are provided through terraform.tfvars (not committed to git)
resource "github_actions_secret" "vite_aws_region" {
  repository      = "sunnychopper.github.io"
  secret_name     = "VITE_AWS_REGION"
  plaintext_value = var.aws_region
}

resource "github_actions_secret" "vite_aws_user_pool_id" {
  repository      = "sunnychopper.github.io"
  secret_name     = "VITE_AWS_USER_POOL_ID"
  plaintext_value = var.cognito_user_pool_id
}

resource "github_actions_secret" "vite_aws_user_pool_web_client_id" {
  repository      = "sunnychopper.github.io"
  secret_name     = "VITE_AWS_USER_POOL_WEB_CLIENT_ID"
  plaintext_value = var.cognito_client_id
}

resource "github_actions_secret" "vite_aws_identity_pool_id" {
  repository      = "sunnychopper.github.io"
  secret_name     = "VITE_AWS_IDENTITY_POOL_ID"
  plaintext_value = var.cognito_identity_pool_id
}

resource "github_actions_secret" "vite_api_base_url" {
  repository      = "sunnychopper.github.io"
  secret_name     = "VITE_API_BASE_URL"
  plaintext_value = var.api_base_url
}
