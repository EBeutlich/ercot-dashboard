import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

function WindGeneration() {
  const { data, isLoading } = useQuery({
    queryKey: ['windGeneration'],
    queryFn: ercotApi.getWindGeneration,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Wind Generation</h1>
        <p className="text-slate-500">Real-time wind power output across ERCOT</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Current Output"
          value={Math.round(data?.current || 0)}
          unit="MW"
          icon="💨"
        />
        <StatCard
          title="Installed Capacity"
          value="37,000"
          unit="MW"
          icon="🏗️"
        />
        <StatCard
          title="Capacity Factor"
          value={Math.round(((data?.current || 0) / 37000) * 100)}
          unit="%"
          icon="📊"
        />
      </div>

      <Card title="24-Hour Wind Generation">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data?.hourly || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
              <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => `${v.toLocaleString()} MW`} labelFormatter={(h) => `Hour: ${h}:00`} />
              <Area type="monotone" dataKey="value" stroke="#38a169" fill="#c6f6d5" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default WindGeneration;
