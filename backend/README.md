# ERCOT API Proxy - Lambda Backend

Serverless backend that securely proxies requests to the ERCOT Public API. Credentials are stored in AWS Systems Manager Parameter Store (free tier).

## Architecture

```
┌─────────────────┐     ┌───────────────┐     ┌─────────────────┐     ┌────────────┐
│  React Frontend │────▶│  API Gateway  │────▶│  Lambda Function│────▶│  ERCOT API │
│    (Amplify)    │     │    (REST)     │     │  (Node.js 20)   │     │            │
└─────────────────┘     └───────────────┘     └────────┬────────┘     └────────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  SSM Parameter  │
                                              │     Store       │
                                              │  (Credentials)  │
                                              └─────────────────┘
```

## Prerequisites

1. **AWS CLI** configured with appropriate credentials
2. **AWS SAM CLI** installed: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
3. **ERCOT API credentials** from https://apiexplorer.ercot.com

## Quick Deploy

### 1. Store Credentials in SSM Parameter Store

Run the PowerShell script (Windows):
```powershell
.\setup-ssm-params.ps1
```

Or manually via AWS CLI:
```bash
# Replace with your actual credentials
aws ssm put-parameter --name "/ercot/subscription-key" --value "YOUR_KEY" --type "SecureString" --overwrite
aws ssm put-parameter --name "/ercot/username" --value "your@email.com" --type "SecureString" --overwrite
aws ssm put-parameter --name "/ercot/password" --value "YOUR_PASSWORD" --type "SecureString" --overwrite
```

### 2. Build and Deploy Lambda

```bash
cd backend

# Install dependencies
npm install

# Build with SAM
sam build

# Deploy (first time - guided mode)
sam deploy --guided

# Subsequent deploys
sam deploy
```

During guided deployment, accept defaults or customize:
- Stack name: `ercot-api-proxy`
- Region: `us-east-1` (or your preferred region)
- Confirm changes: `Y`
- Allow SAM CLI IAM role creation: `Y`

### 3. Get Your API Endpoint

After deployment, SAM outputs the API URL:
```
Outputs
------------------------------------------------------------------
Key                 ApiEndpoint
Description         API Gateway endpoint URL
Value               https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/api
```

### 4. Configure Frontend

Set the API URL in Amplify environment variables:

**AWS Amplify Console:**
1. Go to your Amplify app
2. App settings → Environment variables
3. Add: `VITE_ERCOT_API_URL` = `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/api`
4. Redeploy your app

**Local development:**
```bash
# .env
VITE_ERCOT_API_URL=https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/api
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/system-conditions` | Real-time system conditions |
| `GET /api/fuel-mix` | Generation by fuel type |
| `GET /api/wind` | Wind generation forecast |
| `GET /api/solar` | Solar generation forecast |
| `GET /api/load-forecast` | System load forecast |
| `GET /api/real-time-prices` | Real-time settlement prices |
| `GET /api/day-ahead-prices` | Day-ahead market prices |

## Cost Estimate (Free Tier)

| Service | Free Tier | Estimated Usage |
|---------|-----------|-----------------|
| Lambda | 1M requests/month | ~10K requests/month |
| API Gateway | 1M calls/month | ~10K calls/month |
| SSM Parameter Store | 10K standard params | 3 params |
| **Total** | — | **$0.00** |

## Cleanup

To remove all resources:
```bash
sam delete --stack-name ercot-api-proxy
```

Remove SSM parameters:
```bash
aws ssm delete-parameter --name "/ercot/subscription-key"
aws ssm delete-parameter --name "/ercot/username"
aws ssm delete-parameter --name "/ercot/password"
```

## Troubleshooting

**Lambda can't find SSM parameters:**
- Ensure parameters exist: `aws ssm get-parameters --names "/ercot/subscription-key" --with-decryption`
- Check Lambda has correct IAM permissions (SAM template handles this)
- Verify Lambda region matches SSM parameter region

**CORS errors:**
- API Gateway CORS is pre-configured in the SAM template
- For custom domains, update `AllowedOrigin` parameter

**Token errors:**
- Verify your ERCOT credentials are correct
- Token is cached for 1 hour in Lambda memory
