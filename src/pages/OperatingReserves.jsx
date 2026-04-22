import Card from '../components/Card';
import StatCard from '../components/StatCard';

function OperatingReserves() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Operating Reserves</h1>
        <p className="text-slate-500">Real-time operating reserve levels and requirements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Reserves" value="6,200" unit="MW" icon="🔋" />
        <StatCard title="Required Minimum" value="2,300" unit="MW" icon="⚠️" />
        <StatCard title="ORDC Adder" value="$0.25" unit="/MWh" icon="💰" />
        <StatCard title="Reserve Margin" value="3,900" unit="MW" icon="✅" />
      </div>

      <Card title="Reserve Breakdown">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Regulation Up</span>
              <span>700 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Regulation Down</span>
              <span>600 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Responsive Reserve</span>
              <span>2,800 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Non-Spinning Reserve</span>
              <span>2,100 MW</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default OperatingReserves;
