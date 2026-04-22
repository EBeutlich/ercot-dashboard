import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

function SystemFrequency() {
  const { data, isLoading } = useQuery({
    queryKey: ['systemConditions'],
    queryFn: ercotApi.getCurrentConditions,
    refetchInterval: 5000,
  });

  // Generate mock frequency data for the chart
  const frequencyData = Array.from({ length: 60 }, (_, i) => ({
    time: i,
    frequency: 60 + (Math.random() - 0.5) * 0.1
  }));

  if (isLoading) return <LoadingSpinner />;

  const currentFreq = data?.frequency || 60.0;
  const deviation = currentFreq - 60;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Frequency</h1>
        <p className="text-slate-500">Real-time grid frequency monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Current Frequency"
          value={currentFreq.toFixed(3)}
          unit="Hz"
          icon="〰️"
        />
        <StatCard
          title="Deviation"
          value={(deviation * 1000).toFixed(1)}
          unit="mHz"
          trendDirection={deviation > 0 ? 'up' : 'down'}
          icon="↕️"
        />
        <StatCard
          title="Status"
          value={Math.abs(deviation) < 0.02 ? 'Normal' : 'Alert'}
          icon={Math.abs(deviation) < 0.02 ? '✅' : '⚠️'}
        />
      </div>

      <Card title="Frequency Over Last Hour">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tickFormatter={(t) => `${60-t}m ago`} reversed />
              <YAxis domain={[59.9, 60.1]} tickFormatter={(v) => `${v.toFixed(2)} Hz`} />
              <Tooltip formatter={(v) => `${v.toFixed(3)} Hz`} />
              <ReferenceLine y={60} stroke="#3182ce" strokeDasharray="5 5" label="Nominal" />
              <ReferenceLine y={59.95} stroke="#e53e3e" strokeDasharray="3 3" />
              <ReferenceLine y={60.05} stroke="#e53e3e" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="frequency" stroke="#38a169" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default SystemFrequency;
