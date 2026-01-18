variable "github_token" {
  description = "GitHub personal access token with repo and admin:repo_hook permissions"
  type        = string
  sensitive   = true
  default     = ""
  # Can be set via terraform.tfvars or GITHUB_TOKEN environment variable
  # Terraform will automatically use GITHUB_TOKEN env var if variable is empty
}

variable "aws_region" {
  description = "AWS region for Cognito"
  type        = string
  default     = "us-east-1"
}

variable "cognito_user_pool_id" {
  description = "AWS Cognito User Pool ID"
  type        = string
  sensitive   = true
}

variable "cognito_client_id" {
  description = "AWS Cognito App Client ID"
  type        = string
  sensitive   = true
}

variable "cognito_identity_pool_id" {
  description = "AWS Cognito Identity Pool ID (optional)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "api_base_url" {
  description = "API base URL"
  type        = string
  default     = "https://api.sunnysingh.tech"
}
