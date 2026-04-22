import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

function SystemDemand() {
  const { data, isLoading } = useQuery({
    queryKey: ['systemDemand'],
    queryFn: ercotApi.getCurrentConditions,
    refetchInterval: 60000,
  });

  const { data: forecast } = useQuery({
    queryKey: ['loadForecast'],
    queryFn: ercotApi.getLoadForecast,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Demand</h1>
        <p className="text-slate-500">Current ERCOT grid demand and load patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Current Demand"
          value={Math.round(data?.systemLoad || 0)}
          unit="MW"
          icon="📊"
        />
        <StatCard
          title="Peak Today"
          value={Math.round((data?.systemLoad || 0) * 1.15)}
          unit="MW"
          icon="📈"
        />
        <StatCard
          title="Min Today"
          value={Math.round((data?.systemLoad || 0) * 0.7)}
          unit="MW"
          icon="📉"
        />
      </div>

      <Card title="24-Hour Demand Forecast">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast?.forecast || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} MW`} labelFormatter={(h) => `Hour: ${h}:00`} />
              <Area type="monotone" dataKey="load" stroke="#3182ce" fill="#bee3f8" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default SystemDemand;
