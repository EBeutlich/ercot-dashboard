import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#3182ce', '#38a169', '#718096', '#d69e2e', '#e53e3e', '#805ad5'];

function GenerationByFuel() {
  const { data, isLoading } = useQuery({
    queryKey: ['fuelMix'],
    queryFn: ercotApi.getGenerationByFuel,
    refetchInterval: 300000,
  });

  if (isLoading) return <LoadingSpinner />;

  const fuels = data?.fuels || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Generation by Fuel</h1>
        <p className="text-slate-500">Current power generation mix in the ERCOT grid</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Fuel Mix Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuels}
                  dataKey="mw"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ type, percentage }) => `${percentage}%`}
                >
                  {fuels.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} MW`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Generation Capacity">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fuels} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `${(v/1000).toFixed(0)}k MW`} />
                <YAxis type="category" dataKey="type" width={100} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} MW`} />
                <Bar dataKey="mw" fill="#3182ce" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Fuel Type Details">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Fuel Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Generation (MW)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Percentage</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {fuels.map((fuel, index) => (
                <tr key={fuel.type}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="font-medium">{fuel.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{fuel.mw.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{fuel.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default GenerationByFuel;
