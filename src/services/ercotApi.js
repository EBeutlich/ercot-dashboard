import axios from 'axios';

// ERCOT MIS Public API Base URLs
const ERCOT_API_BASE = 'https://www.ercot.com/api/1/services/read';
const ERCOT_PUBLIC_BASE = 'https://www.ercot.com/content/cdr/html';

// Create axios instance with default configuration
const apiClient = axios.create({
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// ERCOT Public Data Endpoints
export const ercotApi = {
  // System-Wide Data
  async getSystemDemand() {
    const response = await apiClient.get(`${ERCOT_PUBLIC_BASE}/real_time_system_conditions.html`);
    return parseSystemConditions(response.data);
  },

  async getCurrentConditions() {
    // Real-time grid conditions
    return fetchErcotData('real_time_system_conditions');
  },

  // Pricing Data
  async getRealTimePrices() {
    return fetchErcotData('real_time_spp');
  },

  async getDayAheadPrices() {
    return fetchErcotData('dam_spp');
  },

  async getHubPrices() {
    return fetchErcotData('hub_prices');
  },

  // Generation Data
  async getGenerationByFuel() {
    return fetchErcotData('fuel_mix');
  },

  async getWindGeneration() {
    return fetchErcotData('wind_generation');
  },

  async getSolarGeneration() {
    return fetchErcotData('solar_generation');
  },

  // Load & Forecast
  async getLoadForecast() {
    return fetchErcotData('load_forecast');
  },

  async getWeatherZones() {
    return fetchErcotData('weather_zones');
  },

  // Grid Operations
  async getOutageSchedule() {
    return fetchErcotData('outage_schedule');
  },

  async getAncillaryServices() {
    return fetchErcotData('ancillary_services');
  },

  async getTransmissionConstraints() {
    return fetchErcotData('transmission_constraints');
  },

  async getSystemFrequency() {
    return fetchErcotData('system_frequency');
  },

  async getReserveCapacity() {
    return fetchErcotData('reserve_capacity');
  },

  // Alerts & Notices
  async getEmergencyAlerts() {
    return fetchErcotData('emergency_alerts');
  },

  async getMarketNotices() {
    return fetchErcotData('market_notices');
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
  }
}

// Helper function to fetch ERCOT data
async function fetchErcotData(endpoint) {
  try {
    const response = await apiClient.get(`${ERCOT_API_BASE}/${endpoint}`);
    return response.data;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const apiError = new ErcotApiError(errorMessage, error);
    throw apiError;
  }
}

// Generate user-friendly error messages
function getErrorMessage(error) {
  if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
    return 'Network error: Unable to connect to ERCOT API';
  }
  if (error.code === 'ECONNABORTED' || error.code === 'ERR_TIMEOUT') {
    return 'Request timeout: ERCOT API is not responding';
  }
  if (error.response) {
    const status = error.response.status;
    if (status === 404) return 'Data not found on ERCOT API';
    if (status === 429) return 'Rate limited: Too many requests to ERCOT API';
    if (status >= 500) return 'ERCOT API server error';
    return `ERCOT API error (HTTP ${status})`;
  }
  return error.message || 'Unknown error occurred';
}

// Parse HTML response for system conditions
function parseSystemConditions(html) {
  // Parse the HTML response to extract system conditions data
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract values from the HTML structure
  const getValue = (selector) => {
    const el = doc.querySelector(selector);
    return el ? parseFloat(el.textContent.replace(/[^0-9.-]/g, '')) : null;
  };

  return {
    timestamp: new Date().toISOString(),
    systemLoad: getValue('.systemLoad') || getValue('[data-field="systemLoad"]'),
    totalGeneration: getValue('.totalGeneration') || getValue('[data-field="totalGeneration"]'),
    windOutput: getValue('.windOutput') || getValue('[data-field="windOutput"]'),
    solarOutput: getValue('.solarOutput') || getValue('[data-field="solarOutput"]'),
    frequency: getValue('.frequency') || getValue('[data-field="frequency"]'),
  };
}

export default ercotApi;
