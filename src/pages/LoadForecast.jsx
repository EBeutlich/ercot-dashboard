import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

function LoadForecast() {
  const { data, isLoading } = useQuery({
    queryKey: ['loadForecast'],
    queryFn: ercotApi.getLoadForecast,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingSpinner />;

  const peakLoad = Math.max(...(data?.forecast || []).map(f => f.load));
  const minLoad = Math.min(...(data?.forecast || []).map(f => f.load));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Load Forecast</h1>
        <p className="text-slate-500">ERCOT system load forecast for the next 24 hours</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Current Load"
          value={Math.round(data?.current || 0)}
          unit="MW"
          icon="📊"
        />
        <StatCard
          title="Forecasted Peak"
          value={Math.round(peakLoad)}
          unit="MW"
          icon="📈"
        />
        <StatCard
          title="Forecasted Min"
          value={Math.round(minLoad)}
          unit="MW"
          icon="📉"
        />
        <StatCard
          title="Range"
          value={Math.round(peakLoad - minLoad)}
          unit="MW"
          icon="↕️"
        />
      </div>

      <Card title="24-Hour Load Forecast">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.forecast || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} MW`} labelFormatter={(h) => `Hour: ${h}:00`} />
              <Legend />
              <Line type="monotone" dataKey="load" stroke="#3182ce" name="Forecasted Load" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default LoadForecast;
