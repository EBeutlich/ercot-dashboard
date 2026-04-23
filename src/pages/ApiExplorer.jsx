import { useState, useCallback } from 'react';
import { ercotApi } from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

// All available API methods with their descriptions
const API_METHODS = [
  { name: 'getSystemDemand', description: 'Real-time system conditions and demand', category: 'System' },
  { name: 'getCurrentConditions', description: 'Current system operating conditions', category: 'System' },
  { name: 'getRealTimePrices', description: 'Real-time settlement point prices', category: 'Pricing' },
  { name: 'getDayAheadPrices', description: 'Day-ahead market settlement prices', category: 'Pricing' },
  { name: 'getHubPrices', description: 'Hub pricing data', category: 'Pricing' },
  { name: 'getGenerationByFuel', description: 'Generation breakdown by fuel type', category: 'Generation' },
  { name: 'getWindGeneration', description: 'Wind generation and forecast', category: 'Generation' },
  { name: 'getSolarGeneration', description: 'Solar generation and forecast', category: 'Generation' },
  { name: 'getLoadForecast', description: 'Load forecast data', category: 'Load & Forecast' },
  { name: 'getWeatherZones', description: 'Weather zone information', category: 'Load & Forecast' },
  { name: 'getOutageSchedule', description: 'Planned outage schedule', category: 'Grid Operations' },
  { name: 'getAncillaryServices', description: 'Ancillary services capacity monitor', category: 'Grid Operations' },
  { name: 'getTransmissionConstraints', description: 'Transmission constraints', category: 'Grid Operations' },
  { name: 'getSystemFrequency', description: 'System frequency data', category: 'Grid Operations' },
  { name: 'getReserveCapacity', description: 'Reserve capacity data', category: 'Grid Operations' },
  { name: 'getEmergencyAlerts', description: 'Emergency and grid alerts', category: 'Alerts' },
  { name: 'getMarketNotices', description: 'Market notices and announcements', category: 'Alerts' },
];

function ApiExplorer() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [executionTime, setExecutionTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [expandedJson, setExpandedJson] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'raw'

  // Get unique categories
  const categories = ['All', ...new Set(API_METHODS.map(m => m.category))];

  // Filter methods by category
  const filteredMethods = filterCategory === 'All' 
    ? API_METHODS 
    : API_METHODS.filter(m => m.category === filterCategory);

  // Check if result is CSV-like string data
  const isCsvData = (data) => {
    if (typeof data !== 'string') return false;
    const lines = data.trim().split('\n');
    if (lines.length < 2) return false;
    const firstLineCommas = (lines[0].match(/,/g) || []).length;
    return firstLineCommas > 0 && lines.every(line => {
      const commas = (line.match(/,/g) || []).length;
      return Math.abs(commas - firstLineCommas) <= 1; // Allow slight variance
    });
  };

  // Parse CSV string to array of objects
  const parseCsv = (csvString) => {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      return row;
    });
  };

  const executeApi = useCallback(async (methodName) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedMethod(methodName);
    
    const startTime = performance.now();
    
    try {
      const apiMethod = ercotApi[methodName];
      if (!apiMethod) {
        throw new Error(`Method ${methodName} not found in ercotApi`);
      }
      
      const data = await apiMethod();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setResult(data);
      setExecutionTime(duration);
      
      // Add to history
      setHistory(prev => [
        {
          method: methodName,
          timestamp: new Date().toISOString(),
          duration,
          success: true,
          resultPreview: JSON.stringify(data).slice(0, 100) + '...'
        },
        ...prev.slice(0, 9) // Keep last 10 entries
      ]);
    } catch (err) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      setError({
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });
      setExecutionTime(duration);
      
      // Add to history
      setHistory(prev => [
        {
          method: methodName,
          timestamp: new Date().toISOString(),
          duration,
          success: false,
          error: err.message
        },
        ...prev.slice(0, 9)
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const copyToClipboard = useCallback(() => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    }
  }, [result]);

  const downloadJson = useCallback(() => {
    if (result) {
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedMethod}-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [result, selectedMethod]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">API Explorer</h1>
        <p className="text-slate-600 mt-1">
          Low-level interface for testing ERCOT API methods directly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Method Selection Panel */}
        <div className="lg:col-span-1">
          <Card title="API Methods">
            {/* Category Filter */}
            <div className="mb-4">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-ercot-accent focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Method List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMethods.map((method) => (
                <button
                  key={method.name}
                  onClick={() => executeApi(method.name)}
                  disabled={loading}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedMethod === method.name
                      ? 'bg-ercot-accent text-white border-ercot-accent'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  } ${loading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <div className={`font-mono text-sm ${
                    selectedMethod === method.name ? 'text-white' : 'text-slate-900'
                  }`}>
                    {method.name}()
                  </div>
                  <div className={`text-xs mt-1 ${
                    selectedMethod === method.name ? 'text-slate-200' : 'text-slate-500'
                  }`}>
                    {method.description}
                  </div>
                  <div className={`text-xs mt-1 ${
                    selectedMethod === method.name ? 'text-slate-300' : 'text-slate-400'
                  }`}>
                    {method.category}
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Result Panel */}
        <div className="lg:col-span-2">
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span>
                  {selectedMethod ? `Response: ${selectedMethod}()` : 'Response'}
                </span>
                {executionTime !== null && (
                  <span className="text-sm font-normal text-slate-500">
                    {executionTime}ms
                  </span>
                )}
              </div>
            }
          >
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 font-medium mb-2">Error</div>
                <div className="text-sm text-red-700 space-y-1">
                  <p><span className="font-medium">Message:</span> {error.message}</p>
                  {error.code && <p><span className="font-medium">Code:</span> {error.code}</p>}
                  {error.status && <p><span className="font-medium">Status:</span> {error.status}</p>}
                  {error.response && (
                    <pre className="mt-2 p-2 bg-red-100 rounded text-xs overflow-auto">
                      {JSON.stringify(error.response, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            ) : result ? (
              <div>
                {/* Action Buttons */}
                <div className="flex gap-2 mb-4 flex-wrap">
                  {/* View Mode Toggle for CSV data */}
                  {isCsvData(result) && (
                    <div className="flex rounded-lg border border-slate-300 overflow-hidden mr-2">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`px-3 py-1 text-sm transition-colors ${
                          viewMode === 'table'
                            ? 'bg-ercot-accent text-white'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        📊 Table
                      </button>
                      <button
                        onClick={() => setViewMode('raw')}
                        className={`px-3 py-1 text-sm transition-colors ${
                          viewMode === 'raw'
                            ? 'bg-ercot-accent text-white'
                            : 'bg-slate-100 hover:bg-slate-200'
                        }`}
                      >
                        📄 Raw
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedJson(!expandedJson)}
                    className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    {expandedJson ? 'Collapse' : 'Expand'}
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={downloadJson}
                    className="px-3 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                  >
                    ⬇️ Download
                  </button>
                </div>
                
                {/* Table View for CSV data */}
                {isCsvData(result) && viewMode === 'table' ? (
                  <div className={`overflow-auto ${expandedJson ? 'max-h-[600px]' : 'max-h-48'}`}>
                    {(() => {
                      const rows = parseCsv(result);
                      if (rows.length === 0) return <p className="text-slate-500">No data</p>;
                      const headers = Object.keys(rows[0]);
                      return (
                        <table className="min-w-full divide-y divide-slate-200 text-xs">
                          <thead className="bg-slate-100 sticky top-0">
                            <tr>
                              {headers.map((header) => (
                                <th
                                  key={header}
                                  className="px-3 py-2 text-left font-medium text-slate-700 whitespace-nowrap"
                                >
                                  {header}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {rows.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                {headers.map((header) => (
                                  <td
                                    key={header}
                                    className="px-3 py-1.5 whitespace-nowrap text-slate-700"
                                  >
                                    {row[header]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                    <div className="mt-2 text-xs text-slate-500">
                      Showing {parseCsv(result).length} rows
                    </div>
                  </div>
                ) : (
                  /* JSON/Raw Output */
                  <pre className={`bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto text-xs ${
                    expandedJson ? 'max-h-[600px]' : 'max-h-48'
                  }`}>
                    {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
                  </pre>
                )}
                
                {/* Data Summary */}
                <div className="mt-4 text-sm text-slate-600">
                  <span className="font-medium">Type:</span> {Array.isArray(result) ? `Array[${result.length}]` : typeof result}
                  {typeof result === 'object' && result !== null && !Array.isArray(result) && (
                    <span className="ml-4"><span className="font-medium">Keys:</span> {Object.keys(result).join(', ')}</span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                Select an API method to execute
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Execution History */}
      <Card title="Execution History">
        {history.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No API calls yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Method</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Duration</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {history.map((entry) => (
                  <tr key={entry.timestamp} className={entry.success ? '' : 'bg-red-50'}>
                    <td className="px-4 py-2 text-xs text-slate-600 whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm text-slate-700">
                      {entry.method}()
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {entry.duration}ms
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        entry.success 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {entry.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-600 max-w-xs truncate">
                      {entry.success ? entry.resultPreview : entry.error}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* API Configuration Info */}
      <Card title="Configuration Info">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700">Lambda API URL</div>
            <div className="text-slate-500 mt-1 font-mono text-xs break-all">
              {import.meta.env.VITE_ERCOT_API_URL || '(not configured)'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700">Direct API</div>
            <div className="text-slate-500 mt-1">
              {import.meta.env.VITE_ERCOT_SUBSCRIPTION_KEY ? '✓ Configured' : '✗ Not configured'}
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <div className="font-medium text-slate-700">Fallback</div>
            <div className="text-slate-500 mt-1">CORS Proxy (HTML parsing)</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ApiExplorer;
