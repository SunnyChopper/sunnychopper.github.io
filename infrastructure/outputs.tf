# Outputs to verify secret values (masked for security)
# These outputs show partial/masked values to help verify configuration

output "secret_names" {
  description = "List of secret names that will be created/updated"
  value = [
    github_actions_secret.vite_aws_region.secret_name,
    github_actions_secret.vite_aws_user_pool_id.secret_name,
    github_actions_secret.vite_aws_user_pool_web_client_id.secret_name,
    github_actions_secret.vite_aws_identity_pool_id.secret_name,
    github_actions_secret.vite_api_base_url.secret_name,
  ]
}

output "aws_region_value" {
  description = "AWS Region value (not sensitive, shown for verification)"
  value       = var.aws_region
}

output "api_base_url_value" {
  description = "API Base URL value (not sensitive, shown for verification)"
  value       = var.api_base_url
}

# Masked outputs for sensitive values (shows first/last few characters)
# Marked as sensitive because they reference sensitive variables, even though values are masked
output "cognito_user_pool_id_masked" {
  description = "Cognito User Pool ID (masked for verification)"
  value       = length(var.cognito_user_pool_id) > 0 ? "${substr(var.cognito_user_pool_id, 0, 8)}...${substr(var.cognito_user_pool_id, length(var.cognito_user_pool_id) - 4, -1)}" : "not set"
  sensitive   = true
}

output "cognito_client_id_masked" {
  description = "Cognito Client ID (masked for verification)"
  value       = length(var.cognito_client_id) > 0 ? "${substr(var.cognito_client_id, 0, 8)}...${substr(var.cognito_client_id, length(var.cognito_client_id) - 4, -1)}" : "not set"
  sensitive   = true
}

output "cognito_identity_pool_id_masked" {
  description = "Cognito Identity Pool ID (masked for verification)"
  value       = length(var.cognito_identity_pool_id) > 0 ? "${substr(var.cognito_identity_pool_id, 0, 8)}...${substr(var.cognito_identity_pool_id, length(var.cognito_identity_pool_id) - 4, -1)}" : "not set"
  sensitive   = true
}
