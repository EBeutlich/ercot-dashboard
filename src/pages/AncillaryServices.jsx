import Card from '../components/Card';
import StatCard from '../components/StatCard';

function AncillaryServices() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Ancillary Services</h1>
        <p className="text-slate-500">ERCOT ancillary services market data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Reg-Up" value="$15.50" unit="/MW" icon="⬆️" />
        <StatCard title="Reg-Down" value="$8.25" unit="/MW" icon="⬇️" />
        <StatCard title="RRS" value="$12.00" unit="/MW" icon="🔄" />
        <StatCard title="NSRS" value="$5.75" unit="/MW" icon="⚡" />
      </div>

      <Card title="Ancillary Services Overview">
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Regulation Up (Reg-Up)</h4>
            <p className="text-sm text-slate-600">Capacity available to increase generation or decrease load within 5 minutes</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Regulation Down (Reg-Down)</h4>
            <p className="text-sm text-slate-600">Capacity available to decrease generation or increase load within 5 minutes</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Responsive Reserve Service (RRS)</h4>
            <p className="text-sm text-slate-600">Quick-response reserves that can be deployed within 10 minutes</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold">Non-Spinning Reserve Service (NSRS)</h4>
            <p className="text-sm text-slate-600">Reserves that can be brought online within 30 minutes</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AncillaryServices;
