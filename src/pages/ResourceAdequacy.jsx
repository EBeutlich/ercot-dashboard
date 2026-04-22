import Card from '../components/Card';
import StatCard from '../components/StatCard';

function ResourceAdequacy() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Resource Adequacy</h1>
        <p className="text-slate-500">Long-term resource adequacy and planning metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Reserve Margin" value="22.8" unit="%" icon="📊" />
        <StatCard title="Target Margin" value="13.75" unit="%" icon="🎯" />
        <StatCard title="Planned Capacity" value="95,000" unit="MW" icon="⚡" />
        <StatCard title="Peak Demand Forecast" value="85,000" unit="MW" icon="📈" />
      </div>

      <Card title="Capacity Outlook">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">✅</span>
              <div>
                <h4 className="font-semibold text-green-800">Adequate Resources</h4>
                <p className="text-sm text-green-600">Current reserve margin exceeds planning target</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold">Summer 2024</h4>
              <p className="text-2xl font-bold text-ercot-accent mt-2">22.8%</p>
              <p className="text-sm text-slate-500">Projected Reserve Margin</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-semibold">Winter 2024-25</h4>
              <p className="text-2xl font-bold text-ercot-accent mt-2">31.2%</p>
              <p className="text-sm text-slate-500">Projected Reserve Margin</p>
            </div>
          </div>
        </div>
      </Card>

      <Card title="New Generation in Queue">
        <div className="space-y-3">
          {[
            { type: 'Solar', capacity: 45000, status: 'Under Study' },
            { type: 'Wind', capacity: 28000, status: 'Under Study' },
            { type: 'Battery Storage', capacity: 35000, status: 'Under Study' },
            { type: 'Natural Gas', capacity: 8000, status: 'Under Construction' },
          ].map((resource) => (
            <div key={resource.type} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <span className="font-medium">{resource.type}</span>
                <span className="ml-2 text-sm text-slate-500">{resource.capacity.toLocaleString()} MW</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                resource.status === 'Under Construction' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {resource.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default ResourceAdequacy;
