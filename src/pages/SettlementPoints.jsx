import Card from '../components/Card';

const settlementPoints = [
  { name: 'HB_BUSAVG', type: 'Hub', price: 35.42 },
  { name: 'HB_HOUSTON', type: 'Hub', price: 38.15 },
  { name: 'HB_NORTH', type: 'Hub', price: 32.80 },
  { name: 'HB_SOUTH', type: 'Hub', price: 36.90 },
  { name: 'HB_WEST', type: 'Hub', price: 28.55 },
  { name: 'LZ_HOUSTON', type: 'Load Zone', price: 38.22 },
  { name: 'LZ_NORTH', type: 'Load Zone', price: 32.75 },
  { name: 'LZ_SOUTH', type: 'Load Zone', price: 37.10 },
  { name: 'LZ_WEST', type: 'Load Zone', price: 28.40 },
];

function SettlementPoints() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settlement Points</h1>
        <p className="text-slate-500">All ERCOT settlement point prices</p>
      </div>

      <Card title="Settlement Point Prices">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Settlement Point</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Price ($/MWh)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {settlementPoints.map((point) => (
                <tr key={point.name}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{point.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      point.type === 'Hub' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {point.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-mono">${point.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default SettlementPoints;
