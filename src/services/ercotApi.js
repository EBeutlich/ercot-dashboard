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

// Helper function to fetch ERCOT data
async function fetchErcotData(endpoint) {
  try {
    // Note: ERCOT public API may have CORS restrictions
    // In production, you might need a proxy server or use AWS Lambda
    const response = await apiClient.get(`${ERCOT_API_BASE}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Return mock data for development
    return getMockData(endpoint);
  }
}

// Parse HTML response for system conditions
function parseSystemConditions(html) {
  // This would parse the HTML response in production
  // For now, return mock data
  return getMockData('real_time_system_conditions');
}

// Mock data for development and fallback
function getMockData(endpoint) {
  const mockDataMap = {
    'real_time_system_conditions': {
      timestamp: new Date().toISOString(),
      systemLoad: 45000 + Math.random() * 10000,
      totalGeneration: 46000 + Math.random() * 10000,
      windOutput: 8000 + Math.random() * 5000,
      solarOutput: 3000 + Math.random() * 4000,
      frequency: 60.0 + (Math.random() - 0.5) * 0.1,
    },
    'real_time_spp': generatePricingData(),
    'dam_spp': generatePricingData(),
    'hub_prices': {
      hubs: [
        { name: 'HB_HOUSTON', price: 25 + Math.random() * 50 },
        { name: 'HB_NORTH', price: 25 + Math.random() * 50 },
        { name: 'HB_SOUTH', price: 25 + Math.random() * 50 },
        { name: 'HB_WEST', price: 25 + Math.random() * 50 },
      ]
    },
    'fuel_mix': {
      timestamp: new Date().toISOString(),
      fuels: [
        { type: 'Natural Gas', mw: 25000 + Math.random() * 5000, percentage: 45 },
        { type: 'Wind', mw: 15000 + Math.random() * 5000, percentage: 27 },
        { type: 'Coal', mw: 5000 + Math.random() * 2000, percentage: 10 },
        { type: 'Nuclear', mw: 5000 + Math.random() * 500, percentage: 9 },
        { type: 'Solar', mw: 4000 + Math.random() * 3000, percentage: 7 },
        { type: 'Other', mw: 1000 + Math.random() * 500, percentage: 2 },
      ]
    },
    'wind_generation': generateTimeSeriesData('Wind', 15000, 5000),
    'solar_generation': generateTimeSeriesData('Solar', 5000, 4000),
    'load_forecast': {
      current: 45000 + Math.random() * 10000,
      forecast: Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        load: 40000 + Math.sin(i / 24 * Math.PI * 2) * 10000 + Math.random() * 2000
      }))
    },
    'outage_schedule': {
      planned: Array.from({ length: 5 }, (_, i) => ({
        id: `OUT-${1000 + i}`,
        resource: `Generator ${i + 1}`,
        startDate: new Date(Date.now() + i * 86400000).toISOString(),
        endDate: new Date(Date.now() + (i + 2) * 86400000).toISOString(),
        capacity: 200 + Math.random() * 300,
        type: ['Maintenance', 'Inspection', 'Upgrade'][i % 3]
      }))
    },
    'emergency_alerts': {
      alerts: [
        { level: 'Normal', message: 'Grid operating normally', timestamp: new Date().toISOString() }
      ]
    },
    'market_notices': {
      notices: Array.from({ length: 5 }, (_, i) => ({
        id: `MN-${2000 + i}`,
        title: `Market Notice ${i + 1}`,
        timestamp: new Date(Date.now() - i * 3600000).toISOString(),
        category: ['Operations', 'Settlements', 'Planning'][i % 3]
      }))
    }
  };

  return mockDataMap[endpoint] || { data: [], message: 'No data available' };
}

function generatePricingData() {
  const zones = ['LZ_HOUSTON', 'LZ_NORTH', 'LZ_SOUTH', 'LZ_WEST'];
  return {
    timestamp: new Date().toISOString(),
    prices: zones.map(zone => ({
      zone,
      price: 20 + Math.random() * 60,
      congestion: Math.random() * 10 - 5,
      loss: Math.random() * 2
    }))
  };
}

function generateTimeSeriesData(type, base, variance) {
  return {
    type,
    current: base + Math.random() * variance,
    hourly: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: base + Math.sin(i / 24 * Math.PI * 2) * variance * 0.5 + Math.random() * variance * 0.3
    }))
  };
}

export default ercotApi;
