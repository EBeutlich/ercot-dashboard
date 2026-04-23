import { SSMClient, GetParametersCommand } from '@aws-sdk/client-ssm';
import axios from 'axios';
import AdmZip from 'adm-zip';

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

// Fetch archive list from ERCOT API
async function fetchArchiveList(reportId, credentials) {
  const token = await getToken(credentials);

  const response = await axios.get(`${ERCOT_API_BASE}/archive/${reportId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': credentials.subscriptionKey,
      'Accept': 'application/json',
    },
  });

  return response.data;
}

// Download actual data file from ERCOT archive
async function downloadArchiveFile(downloadUrl, credentials) {
  const token = await getToken(credentials);

  const response = await axios.get(downloadUrl, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': credentials.subscriptionKey,
      'Accept': 'application/json,text/csv,application/xml,*/*',
    },
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(response.data);
  
  // Check if response is a ZIP file (starts with "PK" signature)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B) {
    const zip = new AdmZip(buffer);
    const entries = zip.getEntries();
    
    // Find CSV file in the archive
    const csvEntry = entries.find(e => e.entryName.endsWith('.csv'));
    if (csvEntry) {
      return csvEntry.getData().toString('utf8');
    }
    
    // If no CSV, return first file's content
    if (entries.length > 0) {
      return entries[0].getData().toString('utf8');
    }
  }
  
  // Not a ZIP, return as string
  return buffer.toString('utf8');
}

// Fetch and parse data from ERCOT archive
async function fetchFromErcotArchive(reportId, credentials, parser) {
  const archiveList = await fetchArchiveList(reportId, credentials);
  
  // Get the most recent document
  const archives = archiveList?.archives || archiveList?.data || [];
  if (!archives.length) {
    throw new Error(`No archives found for report ${reportId}`);
  }

  // Sort by postDatetime descending and get most recent
  const sorted = archives.sort((a, b) => 
    new Date(b.postDatetime) - new Date(a.postDatetime)
  );
  
  const mostRecent = sorted[0];
  const downloadUrl = mostRecent?._links?.endpoint?.href;
  
  if (!downloadUrl) {
    throw new Error(`No download URL found for report ${reportId}`);
  }

  // Download the actual data
  const rawData = await downloadArchiveFile(downloadUrl, credentials);
  
  // Parse if parser provided, otherwise return raw
  return parser ? parser(rawData) : rawData;
}

// Parse CSV data for system load
function parseSystemLoadCsv(csvData) {
  const lines = csvData.split('\n').filter(line => line.trim());
  if (lines.length < 2) return null;
  
  // Skip header, get most recent data row
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const lastRow = lines[lines.length - 1].split(',').map(v => v.trim().replace(/"/g, ''));
  
  const data = {};
  headers.forEach((header, i) => {
    data[header] = lastRow[i];
  });
  
  return {
    timestamp: data['OperDay'] || data['DeliveryDate'] || new Date().toISOString(),
    systemLoad: parseFloat(data['ERCOT'] || data['SystemLoad'] || data['Load'] || 0),
    coast: parseFloat(data['COAST'] || 0),
    east: parseFloat(data['EAST'] || 0),
    farWest: parseFloat(data['FAR_WEST'] || data['FARWEST'] || 0),
    north: parseFloat(data['NORTH'] || 0),
    northCentral: parseFloat(data['NORTH_C'] || data['NORTHCENTRAL'] || 0),
    southCentral: parseFloat(data['SOUTH_C'] || data['SOUTHCENTRAL'] || 0),
    southern: parseFloat(data['SOUTHERN'] || 0),
    west: parseFloat(data['WEST'] || 0),
  };
}

// Fetch real-time system conditions from ERCOT CDR (fallback for real-time data)
async function fetchRealTimeConditions() {
  const response = await axios.get('https://www.ercot.com/content/cdr/html/real_time_system_conditions.html', {
    timeout: 10000,
  });
  
  const html = response.data;
  
  // Parse HTML table to extract values
  const getValue = (label) => {
    const regex = new RegExp(`${label}[^<]*<[^>]*>\\s*([\\d,.\\-]+)`, 'i');
    const match = html.match(regex);
    return match ? parseFloat(match[1].replace(/,/g, '')) : null;
  };
  
  // Alternative parsing for table structure
  const getTableValue = (label) => {
    // Match pattern: <td>Label</td><td>Value</td>
    const regex = new RegExp(`<td[^>]*>[^<]*${label}[^<]*</td>\\s*<td[^>]*>([^<]+)</td>`, 'i');
    const match = html.match(regex);
    if (match) {
      const val = match[1].trim().replace(/,/g, '');
      return parseFloat(val) || val;
    }
    return null;
  };
  
  return {
    timestamp: new Date().toISOString(),
    frequency: getTableValue('Current Frequency') || getValue('Frequency') || 60.0,
    systemLoad: getTableValue('Actual System Demand') || getTableValue('System Load') || getValue('Demand') || 0,
    totalGeneration: getTableValue('Total System Capacity') || getValue('Capacity') || 0,
    windOutput: getTableValue('Total Wind Output') || getValue('Wind') || 0,
    solarOutput: getTableValue('Total PVGR Output') || getTableValue('Solar') || getValue('Solar') || 0,
    netLoad: getTableValue('Average Net Load') || 0,
    inertia: getTableValue('Current System Inertia') || 0,
  };
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
        // Real-time data not available via archive API - use CDR HTML
        data = await fetchRealTimeConditions();
        break;
      
      case 'fuel-mix':
      case 'fuelMix':
        data = await fetchFromErcotArchive(REPORT_IDS.fuelMix, credentials);
        break;
      
      case 'wind':
      case 'windForecast':
        data = await fetchFromErcotArchive(REPORT_IDS.windForecast, credentials);
        break;
      
      case 'solar':
      case 'solarForecast':
        data = await fetchFromErcotArchive(REPORT_IDS.solarForecast, credentials);
        break;
      
      case 'load-forecast':
      case 'loadForecast':
        data = await fetchFromErcotArchive(REPORT_IDS.loadForecast, credentials);
        break;
      
      case 'actual-load':
      case 'actualLoad':
        data = await fetchFromErcotArchive('NP6-345-CD', credentials, parseSystemLoadCsv);
        break;
      
      case 'real-time-prices':
      case 'realTimePrices':
        data = await fetchFromErcotArchive(REPORT_IDS.realTimePrices, credentials);
        break;
      
      case 'day-ahead-prices':
      case 'dayAheadPrices':
        data = await fetchFromErcotArchive(REPORT_IDS.dayAheadPrices, credentials);
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
              'actual-load',
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
