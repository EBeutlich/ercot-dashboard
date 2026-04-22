# ERCOT API Proxy - SSM Parameter Setup
# Run this script after getting your ERCOT API credentials

# Set your credentials (replace with actual values)
$SubscriptionKey = Read-Host "Enter your ERCOT Subscription Key"
$Username = Read-Host "Enter your ERCOT Username (email)"
$Password = Read-Host "Enter your ERCOT Password" -AsSecureString
$PlainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))

# Create SSM Parameters (SecureString for sensitive data)
Write-Host "Creating SSM parameters..." -ForegroundColor Cyan

aws ssm put-parameter `
    --name "/ercot/subscription-key" `
    --value $SubscriptionKey `
    --type "SecureString" `
    --overwrite

aws ssm put-parameter `
    --name "/ercot/username" `
    --value $Username `
    --type "SecureString" `
    --overwrite

aws ssm put-parameter `
    --name "/ercot/password" `
    --value $PlainPassword `
    --type "SecureString" `
    --overwrite

Write-Host "SSM parameters created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Parameters created:" -ForegroundColor Yellow
Write-Host "  /ercot/subscription-key"
Write-Host "  /ercot/username"
Write-Host "  /ercot/password"
Write-Host ""
Write-Host "You can verify with: aws ssm get-parameters --names '/ercot/subscription-key' '/ercot/username' '/ercot/password' --with-decryption"
