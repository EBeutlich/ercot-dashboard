import { useQuery } from '@tanstack/react-query';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function OutageSchedule() {
  const { data, isLoading } = useQuery({
    queryKey: ['outageSchedule'],
    queryFn: ercotApi.getOutageSchedule,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Outage Schedule</h1>
        <p className="text-slate-500">Planned outages and maintenance schedules</p>
      </div>

      <Card title="Planned Outages">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Resource</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">End Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Capacity (MW)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {(data?.planned || []).map((outage) => (
                <tr key={outage.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{outage.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{outage.resource}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      outage.type === 'Maintenance' ? 'bg-blue-100 text-blue-800' :
                      outage.type === 'Inspection' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {outage.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(outage.startDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(outage.endDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">{outage.capacity.toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default OutageSchedule;
