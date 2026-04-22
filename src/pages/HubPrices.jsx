import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function HubPrices() {
  const { data, isLoading } = useQuery({
    queryKey: ['hubPrices'],
    queryFn: ercotApi.getHubPrices,
    refetchInterval: 60000,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hub Prices</h1>
        <p className="text-slate-500">Settlement point prices at ERCOT trading hubs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {(data?.hubs || []).map((hub) => (
          <Card key={hub.name}>
            <div className="text-center">
              <h3 className="font-semibold text-slate-800">{hub.name.replace('HB_', '')}</h3>
              <p className="text-3xl font-bold text-ercot-accent mt-2">${hub.price.toFixed(2)}</p>
              <p className="text-sm text-slate-500">/MWh</p>
            </div>
          </Card>
        ))}
      </div>

      <Card title="Hub Price Comparison">
        <div className="space-y-4">
          {(data?.hubs || []).map((hub) => (
            <div key={hub.name} className="flex items-center gap-4">
              <span className="w-24 font-medium">{hub.name.replace('HB_', '')}</span>
              <div className="flex-1">
                <div className="w-full bg-slate-200 rounded-full h-6">
                  <div 
                    className="bg-ercot-accent h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.min((hub.price / 100) * 100, 100)}%` }}
                  >
                    <span className="text-xs text-white font-medium">${hub.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default HubPrices;
