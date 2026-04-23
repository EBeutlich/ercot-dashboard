import axios from 'axios';
import { fallbackNotifier } from './fallbackNotifier';

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
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://thingproxy.freeboard.io/fetch/',
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'system-conditions' });
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'system-conditions' });
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'real-time-prices' });
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'day-ahead-prices' });
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
    // Hub prices are part of real-time settlement point prices (HB_* points)
    // Replicate getRealTimePrices logic to avoid 'this' context issues
    let data;
    if (hasLambdaApi()) {
      try {
        data = await fetchFromLambda('real-time-prices');
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'real-time-prices' });
      }
    }
    if (!data && hasApiCredentials()) {
      try {
        data = await fetchFromApi(`/archive/${REPORT_IDS.realTimePrices}`);
      } catch {
        // Fallback
      }
    }
    if (!data) {
      data = await fetchErcotHtml('real_time_spp.html', parseRealTimePrices);
    }
    
    const hubPrices = (data.prices || []).filter(p => 
      p.name?.startsWith('HB_') || p.name?.includes('HUB')
    );
    return {
      timestamp: data.timestamp,
      prices: hubPrices,
    };
  },

  // Generation Data
  async getGenerationByFuel() {
    // ERCOT's fuel_mix.html endpoint no longer exists (404)
    // Use system conditions data which has wind/solar, then estimate other fuels
    if (hasLambdaApi()) {
      try {
        const data = await fetchFromLambda('fuel-mix');
        // If Lambda returns proper fuel data, use it
        if (data?.fuels && data.fuels.length > 0) {
          return data;
        }
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'fuel-mix' });
      }
    }
    
    // Fallback: derive fuel mix from system conditions
    try {
      const conditions = await ercotApi.getCurrentConditions();
      return deriveFuelMixFromConditions(conditions);
    } catch {
      // Return empty data rather than failing silently
      return { timestamp: new Date().toISOString(), fuels: [], total: 0 };
    }
  },

  async getWindGeneration() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('wind');
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'wind' });
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'solar' });
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
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'load-forecast' });
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
    // Weather zones data is embedded in system conditions
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('system-conditions');
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'system-conditions' });
      }
    }
    if (hasApiCredentials()) {
      try {
        return await fetchFromApi(`/archive/${REPORT_IDS.systemConditions}`);
      } catch {
        // Fallback to HTML parsing
      }
    }
    return fetchErcotHtml('real_time_system_conditions.html', parseSystemConditions);
  },

  // Grid Operations
  async getOutageSchedule() {
    return fetchErcotHtml('outage.html', parseOutageSchedule);
  },

  async getAncillaryServices() {
    if (hasLambdaApi()) {
      try {
        return await fetchFromLambda('ancillary-services');
      } catch (err) {
        fallbackNotifier.notify({ message: err.message || 'Lambda API failed', endpoint: 'ancillary-services' });
      }
    }
    // Fallback to real-time conditions which includes AS data
    return fetchErcotHtml('real_time_system_conditions.html', parseAncillaryServices);
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

  const fuelData = {
    'Solar': getValue('Solar'),
    'Wind': getValue('Wind'),
    'Hydro': getValue('Hydro'),
    'Nuclear': getValue('Nuclear'),
    'Coal': getValue('Coal'),
    'Natural Gas': getValue('Gas') || getValue('Natural Gas'),
    'Other': getValue('Other'),
    'Storage': getValue('Storage'),
  };

  // Convert to array format expected by charts
  const fuels = Object.entries(fuelData)
    .filter(([, mw]) => mw != null && mw > 0)
    .map(([type, mw]) => ({ type, mw }));

  // Calculate total and percentages
  const total = fuels.reduce((sum, f) => sum + f.mw, 0);
  fuels.forEach(f => {
    f.percentage = total > 0 ? Math.round((f.mw / total) * 100) : 0;
  });

  return {
    timestamp: new Date().toISOString(),
    fuels,
    total,
  };
}

// Derive approximate fuel mix from system conditions data
// Used as fallback when fuel_mix.html is unavailable
function deriveFuelMixFromConditions(conditions) {
  const windOutput = conditions?.windOutput || 0;
  const solarOutput = conditions?.solarOutput || 0;
  const totalCapacity = conditions?.totalCapacity || conditions?.totalGeneration || 0;
  
  // Calculate remaining capacity after wind and solar
  const remaining = Math.max(0, totalCapacity - windOutput - solarOutput);
  
  // ERCOT typical generation mix estimates (when detailed data unavailable):
  // Nuclear: ~10-12% of total, Gas: ~40-50%, Coal: ~15-20%
  // These are rough estimates based on ERCOT historical data
  const nuclearEstimate = Math.round(totalCapacity * 0.11);
  const coalEstimate = Math.round(remaining * 0.2);
  const gasEstimate = Math.round(remaining - nuclearEstimate - coalEstimate);
  
  const fuels = [
    { type: 'Wind', mw: Math.round(windOutput) },
    { type: 'Solar', mw: Math.round(solarOutput) },
    { type: 'Natural Gas', mw: Math.max(0, gasEstimate) },
    { type: 'Nuclear', mw: nuclearEstimate },
    { type: 'Coal', mw: coalEstimate },
  ].filter(f => f.mw > 0);
  
  const total = fuels.reduce((sum, f) => sum + f.mw, 0);
  fuels.forEach(f => {
    f.percentage = total > 0 ? Math.round((f.mw / total) * 100) : 0;
  });
  
  return {
    timestamp: new Date().toISOString(),
    fuels,
    total,
    estimated: true, // Flag to indicate data is estimated
  };
}

// Transform raw ERCOT API fuel mix data to expected format
function transformFuelMixData(rawData) {
  // If already in expected format, return as-is
  if (rawData?.fuels && Array.isArray(rawData.fuels)) {
    return rawData;
  }

  // Map fuel type keys from API to display names
  const fuelTypeMap = {
    'SOLAR': 'Solar',
    'WIND': 'Wind',
    'HYDRO': 'Hydro',
    'NUCLEAR': 'Nuclear',
    'COAL': 'Coal',
    'COALANDLIG': 'Coal',
    'COAL AND LIGNITE': 'Coal',
    'GAS': 'Natural Gas',
    'GAS-CC': 'Natural Gas',
    'GAS-GT': 'Natural Gas',
    'CCGT': 'Natural Gas',
    'COMBINED CYCLE': 'Natural Gas',
    'NATURAL GAS': 'Natural Gas',
    'OTHER': 'Other',
    'STORAGE': 'Storage',
    'POWER STORAGE': 'Storage',
    'POWER_STORAGE': 'Storage',
  };

  const fuelTotals = {};

  // Handle CSV string format (from Lambda API without parser)
  if (typeof rawData === 'string' && rawData.includes(',')) {
    const lines = rawData.split('\n').filter(line => line.trim());
    if (lines.length >= 2) {
      const headers = lines[0].split(',').map(h => h.trim().replaceAll('"', ''));
      const lastRow = lines.at(-1).split(',').map(v => v.trim().replaceAll('"', ''));
      
      headers.forEach((header, i) => {
        const upperHeader = header.toUpperCase();
        const normalizedType = fuelTypeMap[upperHeader];
        if (normalizedType && lastRow[i]) {
          const mw = Number.parseFloat(lastRow[i]) || 0;
          if (mw > 0) {
            fuelTotals[normalizedType] = (fuelTotals[normalizedType] || 0) + mw;
          }
        }
      });
    }
  } else {
    // Handle ERCOT archive API format (array of records)
    const records = rawData?.data || rawData?.archives || rawData || [];
    
    if (Array.isArray(records)) {
      for (const record of records) {
        const fuelType = record.fuelType || record.fuel || record.FUEL_TYPE || record.settlementPointType;
        const mw = Number.parseFloat(record.genMw || record.gen || record.MW || record.generation || record.value || 0);
        
        if (fuelType && mw > 0) {
          const normalizedType = fuelTypeMap[fuelType.toUpperCase()] || fuelType;
          fuelTotals[normalizedType] = (fuelTotals[normalizedType] || 0) + mw;
        }
      }
    } else if (typeof records === 'object') {
      // Handle object format with fuel type keys
      for (const [key, value] of Object.entries(records)) {
        const normalizedType = fuelTypeMap[key.toUpperCase()] || key;
        const mw = Number.parseFloat(value) || 0;
        if (mw > 0) {
          fuelTotals[normalizedType] = (fuelTotals[normalizedType] || 0) + mw;
        }
      }
    }
  }

  const fuels = Object.entries(fuelTotals)
    .filter(([, mw]) => mw > 0)
    .map(([type, mw]) => ({ type, mw: Math.round(mw) }));

  const total = fuels.reduce((sum, f) => sum + f.mw, 0);
  fuels.forEach(f => {
    f.percentage = total > 0 ? Math.round((f.mw / total) * 100) : 0;
  });

  return {
    timestamp: new Date().toISOString(),
    fuels,
    total,
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
