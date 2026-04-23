import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from 'recharts';
import ercotApi from '../services/ercotApi';
import StatCard from '../components/StatCard';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const COLORS = ['#3182ce', '#38a169', '#d69e2e', '#e53e3e', '#805ad5', '#718096'];

function Home() {
  const { data: conditions, isLoading: conditionsLoading, error: conditionsError, refetch: refetchConditions } = useQuery({
    queryKey: ['systemConditions'],
    queryFn: ercotApi.getCurrentConditions,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: fuelMix, isLoading: fuelLoading } = useQuery({
    queryKey: ['fuelMix'],
    queryFn: ercotApi.getGenerationByFuel,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const { data: prices, isLoading: pricesLoading } = useQuery({
    queryKey: ['realTimePrices'],
    queryFn: ercotApi.getRealTimePrices,
    refetchInterval: 60000,
  });

  if (conditionsLoading) return <LoadingSpinner />;
  if (conditionsError) return <ErrorMessage message={conditionsError.message} error={conditionsError} onRetry={refetchConditions} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Real-time ERCOT grid conditions and market data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="System Load"
          value={Math.round(conditions?.systemLoad || 0)}
          unit="MW"
          trend="+2.3% from yesterday"
          trendDirection="up"
          icon="📊"
        />
        <StatCard
          title="Total Generation"
          value={Math.round(conditions?.totalGeneration || 0)}
          unit="MW"
          icon="⚡"
        />
        <StatCard
          title="Wind Output"
          value={Math.round(conditions?.windOutput || 0)}
          unit="MW"
          trend="18% of total"
          icon="💨"
        />
        <StatCard
          title="Grid Frequency"
          value={conditions?.frequency?.toFixed(3) || '60.000'}
          unit="Hz"
          icon="〰️"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fuel Mix Pie Chart */}
        <Card title="Current Generation by Fuel Type">
          {fuelLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fuelMix?.fuels || []}
                    dataKey="mw"
                    nameKey="type"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ type, percentage }) => `${type}: ${percentage}%`}
                  >
                    {(fuelMix?.fuels || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} MW`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Price Summary */}
        <Card title="Real-Time Prices by Zone">
          {pricesLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            (() => {
              const priceValues = (prices?.prices || []).map(p => p.price);
              const min = Math.min(...priceValues);
              const max = Math.max(...priceValues);
              const avg = priceValues.reduce((a, b) => a + b, 0) / priceValues.length;
              return (
                <div className="space-y-4">
                  {/* Compact Horizontal Bar Chart */}
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={(prices?.prices || []).map(p => ({
                          zone: p.name.replace('LZ_', '').replace('HB_', ''),
                          price: p.price
                        }))}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
                      >
                        <XAxis type="number" tickFormatter={(v) => `$${v}`} domain={['auto', 'auto']} />
                        <YAxis type="category" dataKey="zone" tick={{ fontSize: 11 }} width={50} />
                        <Tooltip formatter={(v) => `$${v.toFixed(2)}/MWh`} />
                        <ReferenceLine x={avg} stroke="#e53e3e" strokeWidth={2} strokeDasharray="4 4" label={{ value: 'Avg', position: 'top', fill: '#e53e3e', fontSize: 10 }} />
                        <Bar dataKey="price" fill="#3182ce" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Stats Summary */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                    <div className="text-center">
                      <span className="text-xs text-slate-500 uppercase">Min</span>
                      <p className="text-lg font-bold text-red-600">${min.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-slate-500 uppercase">Avg</span>
                      <p className="text-lg font-bold text-slate-700">${avg.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <span className="text-xs text-slate-500 uppercase">Max</span>
                      <p className="text-lg font-bold text-green-600">${max.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </Card>
      </div>

      {/* Quick Links */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a href="/real-time-prices" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
            <span className="text-2xl">💰</span>
            <p className="text-sm font-medium mt-2">View Prices</p>
          </a>
          <a href="/generation-by-fuel" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
            <span className="text-2xl">⚡</span>
            <p className="text-sm font-medium mt-2">Generation Mix</p>
          </a>
          <a href="/load-forecast" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
            <span className="text-2xl">📈</span>
            <p className="text-sm font-medium mt-2">Load Forecast</p>
          </a>
          <a href="/emergency-alerts" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-center">
            <span className="text-2xl">🚨</span>
            <p className="text-sm font-medium mt-2">Alerts</p>
          </a>
        </div>
      </Card>
    </div>
  );
}

export default Home;
