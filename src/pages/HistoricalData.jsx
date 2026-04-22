import { useState } from 'react';
import Card from '../components/Card';

function HistoricalData() {
  const [selectedDataType, setSelectedDataType] = useState('prices');
  const [dateRange, setDateRange] = useState('7d');

  const dataTypes = [
    { id: 'prices', label: 'Settlement Prices' },
    { id: 'load', label: 'System Load' },
    { id: 'generation', label: 'Generation Mix' },
    { id: 'wind', label: 'Wind Output' },
    { id: 'solar', label: 'Solar Output' },
  ];

  const dateRanges = [
    { id: '7d', label: 'Last 7 Days' },
    { id: '30d', label: 'Last 30 Days' },
    { id: '90d', label: 'Last 90 Days' },
    { id: '1y', label: 'Last Year' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Historical Data</h1>
        <p className="text-slate-500">Access historical ERCOT market and operations data</p>
      </div>

      <Card title="Data Selection">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Type</label>
            <div className="flex flex-wrap gap-2">
              {dataTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedDataType(type.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedDataType === type.id
                      ? 'bg-ercot-accent text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
            <div className="flex flex-wrap gap-2">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  onClick={() => setDateRange(range.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    dateRange === range.id
                      ? 'bg-ercot-accent text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full md:w-auto px-6 py-3 bg-ercot-primary text-white rounded-lg hover:bg-ercot-secondary transition-colors">
            Download Data (CSV)
          </button>
        </div>
      </Card>

      <Card title="Available Datasets">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dataset</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[
                { name: 'Real-Time SPP', freq: '5-minute', updated: '5 min ago' },
                { name: 'Day-Ahead SPP', freq: 'Hourly', updated: '1 hour ago' },
                { name: 'System Load', freq: '5-minute', updated: '5 min ago' },
                { name: 'Fuel Mix', freq: '15-minute', updated: '15 min ago' },
                { name: 'Wind Generation', freq: '5-minute', updated: '5 min ago' },
                { name: 'Solar Generation', freq: '5-minute', updated: '5 min ago' },
              ].map((dataset) => (
                <tr key={dataset.name}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{dataset.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{dataset.freq}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{dataset.updated}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-ercot-accent hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default HistoricalData;
