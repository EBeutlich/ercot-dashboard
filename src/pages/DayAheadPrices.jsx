import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function DayAheadPrices() {
  const { data, isLoading } = useQuery({
    queryKey: ['dayAheadPrices'],
    queryFn: ercotApi.getDayAheadPrices,
  });

  if (isLoading) return <LoadingSpinner />;

  const chartData = (data?.prices || []).map(p => ({
    zone: p.zone.replace('LZ_', ''),
    price: p.price
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Day-Ahead Prices</h1>
        <p className="text-slate-500">Day-Ahead Market (DAM) settlement point prices</p>
      </div>

      <Card title="Day-Ahead Prices by Zone">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}/MWh`} />
              <Bar dataKey="price" fill="#38a169" name="DAM Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Price Summary">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(data?.prices || []).map((price) => (
            <div key={price.zone} className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-500">{price.zone}</p>
              <p className="text-2xl font-bold text-slate-900">${price.price.toFixed(2)}</p>
              <p className="text-xs text-slate-400">/MWh</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default DayAheadPrices;
