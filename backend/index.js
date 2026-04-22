import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import axios from 'axios';

// SSM Client
const ssm = new SSMClient({ region: process.env.AWS_REGION });

// ERCOT API Configuration
const ERCOT_API_BASE = 'https://api.ercot.com/api/public-reports';
const TOKEN_URL = 'https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token';
const CLIENT_ID = 'fec253ea-0d06-4272-a5e6-b478baeecd70';

// Token cache (persists across warm Lambda invocations)
let cachedToken = null;
let tokenExpiry = null;

// ERCOT Report IDs
const REPORT_IDS = {
  systemConditions: 'NP3-965-ER',
  fuelMix: 'NP4-745-CD',
  windForecast: 'NP4-732-CD',
  solarForecast: 'NP4-737-CD',
  loadForecast: 'NP3-566-CD',
  realTimePrices: 'NP6-788-CD',
  dayAheadPrices: 'NP4-191-CD',
};

// Fetch credentials from SSM Parameter Store
async function getCredentials() {
  const command = new GetParametersCommand({
    Names: [
      '/ercot/subscription-key',
      '/ercot/username',
      '/ercot/password',
    ],
    WithDecryption: true,
  });

  const response = await ssm.send(command);
  
  const params = {};
  for (const param of response.Parameters) {
    const name = param.Name.split('/').pop();
    params[name] = param.Value;
  }

  return {
    subscriptionKey: params['subscription-key'],
    username: params['username'],
    password: params['password'],
  };
}

// Get OAuth2 token (cached)
async function getToken(credentials) {
  // Return cached token if still valid (5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    username: credentials.username,
    password: credentials.password,
    grant_type: 'password',
    scope: `openid ${CLIENT_ID} offline_access`,
    client_id: CLIENT_ID,
    response_type: 'id_token',
  });

  const response = await axios.post(TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  cachedToken = response.data.id_token;
  tokenExpiry = Date.now() + 3600000; // 1 hour

  return cachedToken;
}

// Fetch data from ERCOT API
async function fetchFromErcot(endpoint, credentials) {
  const token = await getToken(credentials);

  const response = await axios.get(`${ERCOT_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': credentials.subscriptionKey,
      'Accept': 'application/json',
    },
  });

  return response.data;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Content-Type': 'application/json',
};

// Lambda handler
export const handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    const credentials = await getCredentials();
    const path = event.pathParameters?.proxy || event.path || '';
    
    // Route to appropriate ERCOT endpoint
    let data;
    
    switch (path) {
      case 'system-conditions':
      case 'systemConditions':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.systemConditions}`, credentials);
        break;
      
      case 'fuel-mix':
      case 'fuelMix':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.fuelMix}`, credentials);
        break;
      
      case 'wind':
      case 'windForecast':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.windForecast}`, credentials);
        break;
      
      case 'solar':
      case 'solarForecast':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.solarForecast}`, credentials);
        break;
      
      case 'load-forecast':
      case 'loadForecast':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.loadForecast}`, credentials);
        break;
      
      case 'real-time-prices':
      case 'realTimePrices':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.realTimePrices}`, credentials);
        break;
      
      case 'day-ahead-prices':
      case 'dayAheadPrices':
        data = await fetchFromErcot(`/archive/${REPORT_IDS.dayAheadPrices}`, credentials);
        break;
      
      default:
        return {
          statusCode: 404,
          headers: corsHeaders,
          body: JSON.stringify({ 
            error: 'Not Found',
            availableEndpoints: [
              'system-conditions',
              'fuel-mix', 
              'wind',
              'solar',
              'load-forecast',
              'real-time-prices',
              'day-ahead-prices',
            ],
          }),
        };
    }

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: error.response?.status || 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: error.message,
        details: error.response?.data || null,
      }),
    };
  }
};
