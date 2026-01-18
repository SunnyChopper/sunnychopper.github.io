# GitHub Secrets Infrastructure as Code

This directory contains Terraform configuration to manage GitHub repository secrets programmatically using environment variables.

## Prerequisites

1. **Terraform installed**: `terraform --version`
2. **GitHub Personal Access Token** with permissions:
   - `repo` (full control)

## Setup

### 1. Create GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token with `repo` scope
3. Copy the token (starts with `ghp_`)

### 2. Configure Terraform

```bash
cd infrastructure

# Copy example variables file
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
# Or set GITHUB_TOKEN environment variable
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 3. Initialize Terraform

```bash
terraform init
```

### 4. Verify Values (Optional)

Before applying, verify your values are correct:

**Option A: Use verification script**

```bash
# Linux/macOS
chmod +x verify-values.sh
./verify-values.sh

# Windows PowerShell
.\verify-values.ps1
```

**Option B: Use Terraform Console**

```bash
terraform console
# Then type: var.cognito_user_pool_id
# Or: var.cognito_client_id
# Press Ctrl+D to exit
```

**Option C: Check plan outputs**

```bash
terraform plan
# Look for the "Outputs:" section showing masked values
```

### 5. Plan and Apply

```bash
# Review changes (sensitive values will be masked)
terraform plan

# Apply changes (creates/updates GitHub secrets)
terraform apply
```

## Workflow Integration

After setting up secrets via Terraform, your GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically use them during the build step.

## Updating Secrets

To update a secret:

1. Update the value in `terraform.tfvars`
2. Run `terraform apply`

## Viewing Secret Values

Terraform masks sensitive values in `terraform plan` output. To verify values:

1. **Use verification scripts**: `./verify-values.sh` or `.\verify-values.ps1`
2. **Use Terraform Console**: `terraform console` then type `var.variable_name`
3. **Check outputs**: `terraform plan` shows masked outputs in the "Outputs:" section
4. **Temporarily remove sensitive flag**: Edit `variables.tf`, remove `sensitive = true`, run plan, then restore

## Security Notes

- Never commit `terraform.tfvars` to git (it's in `.gitignore`)
- Store sensitive values in `terraform.tfvars` locally
- Rotate GitHub tokens regularly
- Use Terraform Cloud/Enterprise for team collaboration
- The verification scripts show masked values for security
