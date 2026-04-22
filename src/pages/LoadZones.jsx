import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const loadZones = [
  { name: 'LZ_HOUSTON', load: 18000, percentage: 32 },
  { name: 'LZ_NORTH', load: 12000, percentage: 21 },
  { name: 'LZ_SOUTH', load: 8000, percentage: 14 },
  { name: 'LZ_WEST', load: 6000, percentage: 11 },
  { name: 'LZ_LCRA', load: 5500, percentage: 10 },
  { name: 'LZ_RAYBN', load: 4000, percentage: 7 },
  { name: 'LZ_AEN', load: 3000, percentage: 5 },
];

function LoadZones() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Load Zones</h1>
        <p className="text-slate-500">Electricity demand by ERCOT load zone</p>
      </div>

      <Card title="Load by Zone">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={loadZones} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k MW`} />
              <YAxis type="category" dataKey="name" width={100} tickFormatter={(v) => v.replace('LZ_', '')} />
              <Tooltip formatter={(value) => `${value.toLocaleString()} MW`} />
              <Bar dataKey="load" fill="#3182ce" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Zone Details">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Load (MW)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loadZones.map((zone) => (
                <tr key={zone.name}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{zone.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{zone.load.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{zone.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default LoadZones;
