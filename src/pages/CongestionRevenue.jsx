import Card from '../components/Card';
import StatCard from '../components/StatCard';

function CongestionRevenue() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Congestion Revenue</h1>
        <p className="text-slate-500">Congestion Revenue Rights (CRR) market data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Daily Congestion" value="$2.4M" icon="💰" />
        <StatCard title="MTD Revenue" value="$48.2M" icon="📊" />
        <StatCard title="YTD Revenue" value="$584M" icon="📈" />
      </div>

      <Card title="Top Congested Paths">
        <div className="space-y-4">
          {[
            { path: 'West to Houston', congestion: 12.50, volume: 2500 },
            { path: 'South to North', congestion: 8.75, volume: 1800 },
            { path: 'Valley Export', congestion: 6.20, volume: 1200 },
            { path: 'Panhandle to West', congestion: 4.80, volume: 3200 },
          ].map((item) => (
            <div key={item.path} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">{item.path}</p>
                <p className="text-sm text-slate-500">{item.volume.toLocaleString()} MW flow</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-red-600">${item.congestion.toFixed(2)}</p>
                <p className="text-xs text-slate-500">congestion component</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default CongestionRevenue;
