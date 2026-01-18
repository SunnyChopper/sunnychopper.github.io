# PowerShell script to verify Terraform variable values before applying
# Usage: .\verify-values.ps1

Write-Host "=== Terraform Variable Verification ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "terraform.tfvars not found!" -ForegroundColor Red
    Write-Host "Copy terraform.tfvars.example to terraform.tfvars and fill in your values"
    exit 1
}

Write-Host "Reading values from terraform.tfvars:" -ForegroundColor Yellow
Write-Host ""

# Helper function to extract value from terraform.tfvars
function Get-TerraformValue {
    param([string]$VariableName)
    $line = Get-Content terraform.tfvars | Select-String -Pattern "^$VariableName\s*="
    if ($line) {
        if ($line.Line -match '=\s*"([^"]+)"') {
            return $matches[1]
        }
    }
    return $null
}

# Helper function to mask sensitive value
function Get-MaskedValue {
    param([string]$Value)
    if ([string]::IsNullOrEmpty($Value)) {
        return "(not set)"
    }
    if ($Value.Length -le 12) {
        return $Value.Substring(0, [Math]::Min(4, $Value.Length)) + "****"
    }
    $startLen = [Math]::Min(8, $Value.Length)
    $endLen = [Math]::Max(0, $Value.Length - 4)
    return $Value.Substring(0, $startLen) + "..." + $Value.Substring($endLen)
}

Write-Host "AWS Region:" -ForegroundColor Green
$awsRegion = Get-TerraformValue "aws_region"
if ($awsRegion) {
    Write-Host "  $awsRegion"
} else {
    Write-Host "  (not set, using default: us-east-1)"
}

Write-Host ""
Write-Host "API Base URL:" -ForegroundColor Green
$apiUrl = Get-TerraformValue "api_base_url"
if ($apiUrl) {
    Write-Host "  $apiUrl"
} else {
    Write-Host "  (not set, using default: https://api.sunnysingh.tech)"
}

Write-Host ""
Write-Host "Cognito User Pool ID:" -ForegroundColor Green
$poolId = Get-TerraformValue "cognito_user_pool_id"
Write-Host "  $(Get-MaskedValue $poolId)"

Write-Host ""
Write-Host "Cognito Client ID:" -ForegroundColor Green
$clientId = Get-TerraformValue "cognito_client_id"
Write-Host "  $(Get-MaskedValue $clientId)"

Write-Host ""
Write-Host "Cognito Identity Pool ID:" -ForegroundColor Green
$identityPoolId = Get-TerraformValue "cognito_identity_pool_id"
if ([string]::IsNullOrEmpty($identityPoolId)) {
    Write-Host "  (not set, optional)"
} else {
    Write-Host "  $(Get-MaskedValue $identityPoolId)"
}

Write-Host ""
Write-Host "GitHub Token:" -ForegroundColor Green
$githubToken = Get-TerraformValue "github_token"
if ([string]::IsNullOrEmpty($githubToken)) {
    # Check environment variable as fallback
    $envToken = $env:GITHUB_TOKEN
    if ([string]::IsNullOrEmpty($envToken)) {
        Write-Host "  (not set in terraform.tfvars or GITHUB_TOKEN env var)"
        Write-Host "  Note: GitHub token can be set via GITHUB_TOKEN environment variable" -ForegroundColor Yellow
    } else {
        Write-Host "  $(Get-MaskedValue $envToken) (from GITHUB_TOKEN env var)"
    }
} else {
    Write-Host "  $(Get-MaskedValue $githubToken)"
}

Write-Host ""
Write-Host "=== Verification Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To see full values in Terraform plan, use terraform console" -ForegroundColor Yellow
