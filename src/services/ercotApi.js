import axios from 'axios';

// Lambda API Configuration (recommended for production)
// Set VITE_ERCOT_API_URL to your Lambda API Gateway endpoint after deployment
// Example: https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/api
const LAMBDA_API_URL = import.meta.env.VITE_ERCOT_API_URL || '';

// Fallback: Direct ERCOT API (requires credentials exposed in browser - not recommended)
const ERCOT_API_BASE = 'https://api.ercot.com/api/public-reports';
const SUBSCRIPTION_KEY = import.meta.env.VITE_ERCOT_SUBSCRIPTION_KEY || '';
const ERCOT_USERNAME = import.meta.env.VITE_ERCOT_USERNAME || '';
const ERCOT_PASSWORD = import.meta.env.VITE_ERCOT_PASSWORD || '';

// OAuth2 token endpoint for ERCOT (used only if direct API mode)
const TOKEN_URL = 'https://ercotb2c.b2clogin.com/ercotb2c.onmicrosoft.com/B2C_1_PUBAPI-ROPC-FLOW/oauth2/v2.0/token';
const CLIENT_ID = 'fec253ea-0d06-4272-a5e6-b478baeecd70';

// Token cache (for direct API mode)
let cachedToken = null;
let tokenExpiry = null;

// Create axios instance
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Fallback: CORS proxy for HTML endpoints (if no API configured)
const ERCOT_PUBLIC_BASE = 'https://www.ercot.com/content/cdr/html';
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
];

// Check if Lambda API is configured (preferred)
function hasLambdaApi() {
  return Boolean(LAMBDA_API_URL);
}

// Check if direct API credentials are configured (fallback)
function hasApiCredentials() {
  return SUBSCRIPTION_KEY && ERCOT_USERNAME && ERCOT_PASSWORD;
}

// Fetch from Lambda API (secure, credentials stored in AWS SSM)
async function fetchFromLambda(endpoint) {
  const response = await apiClient.get(`${LAMBDA_API_URL}/${endpoint}`);
  return response.data;
}

// Get OAuth2 token (cached, refreshes when expired) - for direct API mode only
async function getToken() {
  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    username: ERCOT_USERNAME,
    password: ERCOT_PASSWORD,
    grant_type: 'password',
    scope: `openid ${CLIENT_ID} offline_access`,
    client_id: CLIENT_ID,
    response_type: 'id_token',
  });

  const response = await axios.post(TOKEN_URL, params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  cachedToken = response.data.id_token;
  // Token valid for 1 hour, cache expiry
  tokenExpiry = Date.now() + 3600000;
  
  return cachedToken;
}

// Make authenticated API request (direct mode - not recommended for production)
async function fetchFromApi(endpoint) {
  const token = await getToken();
  
  const response = await axios.get(`${ERCOT_API_BASE}${endpoint}`, {
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY,
    },
  });
  
  return response.data;
}

// ERCOT Public API Report IDs (from API Explorer)
const REPORT_IDS = {
  systemConditions: 'NP3-965-ER', // Real-Time System Conditions
  fuelMix: 'NP4-745-CD',          // Fuel Mix Report
  windForecast: 'NP4-732-CD',     // Wind Power Production
  solarForecast: 'NP4-737-CD',    // Solar Power Production  
  loadForecast: 'NP3-566-CD',     // Load Forecast
  realTimePrices: 'NP6-788-CD',   // Real-Time Settlement Point Prices
  dayAheadPrices: 'NP4-191-CD',   // DAM Settlement Point Prices
};

// ERCOT Public Data Endpoints
export const ercotApi = {
  // System-Wide Data
  async getSystemDemand() {
    // Priority 1: Lambda API (secure, recommended)
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('system-conditions');
      } catch {
        // Fall through to other methods
      }
    }
    // Priority 2: Direct API (credentials in browser - not recommended)
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.systemConditions}`);
      } catch {
        // Fallback to HTML parsing
      }
    }
    // Priority 3: CORS proxy HTML parsing
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  async getCurrentConditions() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('system-conditions');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.systemConditions}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  // Pricing Data
  async getRealTimePrices() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('real-time-prices');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.realTimePrices}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('real_time_spp.html', parseRealTimePrices);
  },

  async getDayAheadPrices() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('day-ahead-prices');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.dayAheadPrices}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('dam_spp.html', parseDayAheadPrices);
  },

  async getHubPrices() {
    return fetchErcotHtml('hub_prices.html', parseHubPrices);
  },

  // Generation Data
  async getGenerationByFuel() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('fuel-mix');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.fuelMix}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('fuel_mix.html', parseFuelMix);
  },

  async getWindGeneration() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('wind');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.windForecast}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('wind_gen.html', parseWindGeneration);
  },

  async getSolarGeneration() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('solar');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.solarForecast}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('solar_gen.html', parseSolarGeneration);
  },

  // Load & Forecast
  async getLoadForecast() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('load-forecast');
      } catch {
        // Fall through
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.loadForecast}`);
      } catch {
        // Fallback
      }
    }
    return fetchErcotHtml('load_forecast.html', parseLoadForecast);
  },

  async getWeatherZones() {
    // Weather zones data is embedded in other endpoints
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  // Grid Operations
  async getOutageSchedule() {
    return fetchErcotHtml('outage.html', parseOutageSchedule);
  },

  async getAncillaryServices() {
    return fetchErcotHtml('as_capacity_monitor.html', parseAncillaryServices);
  },

  async getTransmissionConstraints() {
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  async getSystemFrequency() {
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  async getReserveCapacity() {
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  // Alerts & Notices
  async getEmergencyAlerts() {
    return fetchErcotHtml('grid_alerts.html', parseGridAlerts);
  },

  async getMarketNotices() {
    return fetchErcotHtml('market_notices.html', parseMarketNotices);
  },
};

// Custom error class for better error information
export class ErcotApiError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'ErcotApiError';
    this.code = originalError?.code;
    this.response = originalError?.response;
    this.config = originalError?.config;
    this.isNetworkError = originalError?.code === 'ERR_NETWORK' || originalError?.message === 'Network Error';
    this.isTimeout = originalError?.code === 'ECONNABORTED' || originalError?.code === 'ERR_TIMEOUT';
    this.isCorsError = originalError?.message?.includes('CORS');
  }
}

// Helper function to fetch ERCOT HTML data via CORS proxy
async function fetchErcotHtml(endpoint, parser) {
  const directUrl = `${ERCOT_PUBLIC_BASE}/${endpoint}`;
  let lastError = null;
  
  // Try each CORS proxy
  for (const proxy of CORS_PROXIES) {
    try {
      const proxiedUrl = `${proxy}${encodeURIComponent(directUrl)}`;
      const response = await apiClient.get(proxiedUrl);
      
      if (response.data) {
        return parser(response.data);
      }
    } catch (error) {
      lastError = error;
      // Continue to next proxy
    }
  }
  
  // All proxies failed, throw meaningful error
  const errorMessage = getErrorMessage(lastError);
  throw new ErcotApiError(
    `Unable to fetch ERCOT data: ${errorMessage}. ERCOT blocks direct browser access (CORS). Consider using a backend proxy or the ERCOT Data Portal API.`,
    lastError
  );
}

// Generate user-friendly error messages
function getErrorMessage(error) {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'CORS blocked or network unavailable';
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_TIMEOUT') {
    return 'Request timeout';
  }
  if (error.response) {
    const status = error.response.status;
    if (status === 404) return 'Endpoint not found';
    if (status === 429) return 'Rate limited';
    if (status >= 500) return 'ERCOT server error';
    return `HTTP ${status}`;
  }
  return error.message || 'Unknown error';
}

// Shared HTML parsing utilities
function parseHtmlDoc(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function extractTableValue(doc, labelText) {
  for (const row of doc.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2 && cells[0].textContent.includes(labelText)) {
      const value = cells[1].textContent.replaceAll(/[^0-9.-]/g, '');
      return value ? Number.parseFloat(value) : null;
    }
  }
  return null;
}

// Parse HTML response for system conditions
// Based on actual ERCOT HTML structure at real_time_system_conditions.html
function parseSystemConditions(html) {
  const doc = parseHtmlDoc(html);
  const getValue = (label) => extractTableValue(doc, label);

  return {
    timestamp: new Date().toISOString(),
    frequency: getValue('Current Frequency'),
    systemLoad: getValue('Actual System Demand'),
    totalCapacity: getValue('Total System Capacity'),
    windOutput: getValue('Total Wind Output'),
    solarOutput: getValue('Total PVGR Output'),
    netLoad: getValue('Average Net Load'),
    inertia: getValue('Current System Inertia'),
    dcTieFlows: {
      east: getValue('DC_E'),
      laredo: getValue('DC_L'),
      north: getValue('DC_N'),
      railroad: getValue('DC_R'),
      eaglePass: getValue('DC_S'),
    }
  };
}

// Parse fuel mix data
function parseFuelMix(html) {
  const doc = parseHtmlDoc(html);
  const getValue = (label) => extractTableValue(doc, label);

  return {
    timestamp: new Date().toISOString(),
    solar: getValue('Solar'),
    wind: getValue('Wind'),
    hydro: getValue('Hydro'),
    nuclear: getValue('Nuclear'),
    coal: getValue('Coal'),
    naturalGas: getValue('Gas') || getValue('Natural Gas'),
    other: getValue('Other'),
    storage: getValue('Storage'),
  };
}

// Parse real-time prices
function parseRealTimePrices(html) {
  const doc = parseHtmlDoc(html);
  const prices = [];
  
  for (const row of doc.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const name = cells[0].textContent.trim();
      const price = Number.parseFloat(cells[1].textContent.replaceAll(/[^0-9.-]/g, ''));
      if (name && !Number.isNaN(price)) {
        prices.push({ name, price });
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    prices,
  };
}

// Parse day-ahead prices
function parseDayAheadPrices(html) {
  return parseRealTimePrices(html);
}

// Parse hub prices
function parseHubPrices(html) {
  return parseRealTimePrices(html);
}

// Parse wind generation
function parseWindGeneration(html) {
  const doc = parseHtmlDoc(html);
  const getValue = (label) => extractTableValue(doc, label);

  return {
    timestamp: new Date().toISOString(),
    currentOutput: getValue('Actual') || getValue('Current'),
    forecast: getValue('Forecast'),
    capacity: getValue('Capacity') || getValue('HSL'),
  };
}

// Parse solar generation
function parseSolarGeneration(html) {
  return parseWindGeneration(html);
}

// Parse load forecast
function parseLoadForecast(html) {
  const doc = parseHtmlDoc(html);
  const forecasts = [];
  
  for (const row of doc.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      const hour = cells[0].textContent.trim();
      const load = Number.parseFloat(cells[1].textContent.replaceAll(/[^0-9.-]/g, ''));
      if (hour && !Number.isNaN(load)) {
        forecasts.push({ hour, load });
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    forecasts,
  };
}

// Parse outage schedule
function parseOutageSchedule(html) {
  const doc = parseHtmlDoc(html);
  const getValue = (label) => extractTableValue(doc, label);

  return {
    timestamp: new Date().toISOString(),
    totalOutages: getValue('Total') || getValue('Outage'),
    plannedOutages: getValue('Planned'),
    forcedOutages: getValue('Forced'),
  };
}

// Parse ancillary services
function parseAncillaryServices(html) {
  const doc = parseHtmlDoc(html);
  const getValue = (label) => extractTableValue(doc, label);

  return {
    timestamp: new Date().toISOString(),
    regUp: getValue('Reg-Up') || getValue('Regulation Up'),
    regDown: getValue('Reg-Down') || getValue('Regulation Down'),
    rrs: getValue('RRS') || getValue('Responsive Reserve'),
    nonSpin: getValue('Non-Spin') || getValue('Non-Spinning'),
  };
}

// Parse transmission constraints (placeholder)
function parseTransmissionConstraints(html) {
  return parseSystemConditions(html);
}

// Parse grid alerts
function parseGridAlerts(html) {
  const doc = parseHtmlDoc(html);
  const alerts = [];
  
  for (const row of doc.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 2) {
      alerts.push({
        type: cells[0]?.textContent?.trim() || 'Unknown',
        message: cells[1]?.textContent?.trim() || '',
      });
    }
  }

  return {
    timestamp: new Date().toISOString(),
    alerts,
  };
}

// Parse market notices
function parseMarketNotices(html) {
  return parseGridAlerts(html);
}

export default ercotApi;
