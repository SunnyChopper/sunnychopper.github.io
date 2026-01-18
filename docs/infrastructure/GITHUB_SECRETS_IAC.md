# GitHub Secrets Management via Infrastructure as Code

This document describes how to manage GitHub repository secrets programmatically using Infrastructure as Code (IaC).

## Problem

GitHub Pages requires environment variables to be embedded at build time. These need to be set as GitHub repository secrets, which traditionally requires manual configuration through the GitHub UI.

## Solution: Terraform

**Pros:**

- Version-controlled infrastructure
- Can be integrated with CI/CD
- Supports multiple environments
- Simple and straightforward

**Cons:**

- Requires Terraform setup
- Needs GitHub token management

**Setup:**

1. Install Terraform: `brew install terraform` (macOS) or download from terraform.io
2. Configure GitHub token:
   ```bash
   export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
   ```
3. Navigate to infrastructure directory:
   ```bash
   cd infrastructure
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your values
   terraform init
   terraform plan
   terraform apply
   ```

**Files:**

- `infrastructure/github-secrets.tf` - Main Terraform configuration
- `infrastructure/variables.tf` - Variable definitions
- `infrastructure/terraform.tfvars.example` - Example configuration

## Security Best Practices

1. **Never commit secrets to git**
   - Use `.gitignore` for `terraform.tfvars`
   - Use GitHub Secrets for sensitive values

2. **Rotate credentials regularly**
   - GitHub tokens: Every 90 days
   - Cognito credentials: As needed

3. **Use least privilege**
   - GitHub token: Only `repo` scope

4. **Audit access**
   - Review who has access to GitHub repository secrets

## Troubleshooting

### Terraform: "Authentication failed"

- Verify `GITHUB_TOKEN` is set correctly
- Check token has `repo` scope
- Token must be a classic personal access token (not fine-grained)

### Secrets not updating in builds

- Check GitHub Actions workflow uses `${{ secrets.SECRET_NAME }}`
- Verify secrets are set in repository (not organization) level
- Re-run the deployment workflow after updating secrets

## Next Steps

1. Set up Terraform configuration
2. Configure your secrets in `terraform.tfvars`
3. Run `terraform apply` to create/update secrets
4. Verify secrets are working in a test deployment
