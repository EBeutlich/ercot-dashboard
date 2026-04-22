import Card from '../components/Card';
import StatCard from '../components/StatCard';

function ReserveCapacity() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reserve Capacity</h1>
        <p className="text-slate-500">ERCOT system reserve capacity status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Physical Responsive" value="3,500" unit="MW" icon="⚡" />
        <StatCard title="Operating Reserve" value="2,800" unit="MW" icon="🔋" />
        <StatCard title="Regulation Reserve" value="700" unit="MW" icon="📊" />
        <StatCard title="Spinning Reserve" value="1,200" unit="MW" icon="🔄" />
      </div>

      <Card title="Reserve Levels">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Physical Responsive Capability</span>
              <span className="text-sm text-slate-600">3,500 / 5,000 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div className="bg-green-500 h-4 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Operating Reserve Demand Curve</span>
              <span className="text-sm text-slate-600">2,800 / 4,000 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div className="bg-blue-500 h-4 rounded-full" style={{ width: '70%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Minimum Contingency Level</span>
              <span className="text-sm text-slate-600">2,300 MW required</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div className="bg-yellow-500 h-4 rounded-full" style={{ width: '100%' }} />
            </div>
            <p className="text-xs text-green-600 mt-1">✓ Above minimum requirement</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ReserveCapacity;
