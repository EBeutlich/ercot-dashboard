import { useState } from 'react';
import { fallbackNotifier } from '../services/fallbackNotifier';
import Card from '../components/Card';

const PRESET_ERRORS = [
  {
    name: 'Lambda Timeout',
    message: 'Lambda function timed out after 30000ms',
    endpoint: 'system-conditions'
  },
  {
    name: 'Network Error',
    message: 'Network Error: Failed to fetch',
    endpoint: 'fuel-mix'
  },
  {
    name: 'Authentication Failed',
    message: 'HTTP 401: Unauthorized - Invalid or expired token',
    endpoint: 'real-time-prices'
  },
  {
    name: 'Rate Limited',
    message: 'HTTP 429: Too Many Requests - Rate limit exceeded',
    endpoint: 'day-ahead-prices'
  },
  {
    name: 'Server Error',
    message: 'HTTP 500: Internal Server Error - ERCOT API unavailable',
    endpoint: 'wind-forecast'
  },
  {
    name: 'Gateway Timeout',
    message: 'HTTP 504: Gateway Timeout - Upstream server not responding',
    endpoint: 'solar-forecast'
  },
  {
    name: 'CORS Blocked',
    message: 'CORS policy blocked request to ERCOT API',
    endpoint: 'load-forecast'
  },
  {
    name: 'Invalid Response',
    message: 'Invalid JSON response from Lambda API',
    endpoint: 'ancillary-services'
  }
];

function ErrorInjector() {
  const [customMessage, setCustomMessage] = useState('');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [injectionLog, setInjectionLog] = useState([]);
  const [currentError, setCurrentError] = useState(fallbackNotifier.getLastError());

  const injectError = (message, endpoint) => {
    fallbackNotifier.notify({ message, endpoint });
    setCurrentError(fallbackNotifier.getLastError());
    setInjectionLog(prev => [
      {
        timestamp: new Date().toISOString(),
        message,
        endpoint,
        action: 'inject'
      },
      ...prev.slice(0, 19) // Keep last 20 entries
    ]);
  };

  const clearError = () => {
    fallbackNotifier.clear();
    setCurrentError(null);
    setInjectionLog(prev => [
      {
        timestamp: new Date().toISOString(),
        message: 'Error cleared',
        endpoint: '-',
        action: 'clear'
      },
      ...prev.slice(0, 19)
    ]);
  };

  const handleCustomInject = () => {
    if (customMessage.trim()) {
      injectError(customMessage, customEndpoint || 'custom-endpoint');
      setCustomMessage('');
      setCustomEndpoint('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Error Injector</h1>
        <p className="text-slate-600 mt-1">
          Developer tool for testing error notification handling
        </p>
      </div>

      {/* Current Error State */}
      <Card title="Current Notification State">
        <div className="space-y-4">
          <div className={`p-4 rounded-lg ${currentError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
            {currentError ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-red-600 font-semibold">⚠️ Active Error</span>
                </div>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Message:</span> {currentError.message}</p>
                  <p><span className="font-medium">Endpoint:</span> {currentError.endpoint}</p>
                  <p><span className="font-medium">Timestamp:</span> {currentError.timestamp}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-semibold">✓ No Active Errors</span>
              </div>
            )}
          </div>
          <button
            onClick={clearError}
            disabled={!currentError}
            className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Clear Error
          </button>
        </div>
      </Card>

      {/* Preset Errors */}
      <Card title="Preset Error Scenarios">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_ERRORS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => injectError(preset.message, preset.endpoint)}
              className="p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors text-left"
            >
              <div className="font-medium text-red-800">{preset.name}</div>
              <div className="text-xs text-red-600 mt-1 truncate">{preset.endpoint}</div>
            </button>
          ))}
        </div>
      </Card>

      {/* Custom Error */}
      <Card title="Custom Error Injection">
        <div className="space-y-4">
          <div>
            <label htmlFor="customMessage" className="block text-sm font-medium text-slate-700 mb-1">
              Error Message
            </label>
            <input
              id="customMessage"
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter custom error message..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ercot-accent focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="customEndpoint" className="block text-sm font-medium text-slate-700 mb-1">
              Endpoint (optional)
            </label>
            <input
              id="customEndpoint"
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="e.g., system-conditions"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ercot-accent focus:border-transparent"
            />
          </div>
          <button
            onClick={handleCustomInject}
            disabled={!customMessage.trim()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Inject Custom Error
          </button>
        </div>
      </Card>

      {/* Injection Log */}
      <Card title="Injection History">
        {injectionLog.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No injections yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Action</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Endpoint</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {injectionLog.map((entry) => (
                  <tr key={entry.timestamp} className={entry.action === 'clear' ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.action === 'clear' 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700">{entry.endpoint}</td>
                    <td className="px-4 py-2 text-sm text-slate-700 truncate max-w-xs">{entry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default ErrorInjector;
