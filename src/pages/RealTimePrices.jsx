import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function RealTimePrices() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['realTimePrices'],
    queryFn: ercotApi.getRealTimePrices,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} error={error} onRetry={refetch} />;

  const chartData = (data?.prices || []).map(p => ({
    zone: p.zone.replace('LZ_', ''),
    price: p.price,
    congestion: p.congestion,
    loss: p.loss
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Real-Time Prices</h1>
        <p className="text-slate-500">Settlement Point Prices (SPP) by load zone</p>
      </div>

      <Card title="Current Prices by Zone">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="zone" />
              <YAxis tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}/MWh`} />
              <Bar dataKey="price" fill="#3182ce" name="Price" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card title="Price Details">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price ($/MWh)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Congestion</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Loss</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {(data?.prices || []).map((price) => (
                <tr key={price.zone}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{price.zone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">${price.price.toFixed(2)}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right ${price.congestion > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${price.congestion.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">${price.loss.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default RealTimePrices;
