import Card from '../components/Card';

const reports = [
  { name: 'Capacity, Demand, and Reserves Report', category: 'Planning', frequency: 'Seasonal' },
  { name: 'State of the Grid Report', category: 'Operations', frequency: 'Annual' },
  { name: 'Fuel Mix Report', category: 'Operations', frequency: 'Monthly' },
  { name: 'Wind Integration Report', category: 'Operations', frequency: 'Monthly' },
  { name: 'Solar Integration Report', category: 'Operations', frequency: 'Monthly' },
  { name: 'Demand Response Report', category: 'Operations', frequency: 'Monthly' },
  { name: 'Market Report', category: 'Settlements', frequency: 'Weekly' },
  { name: 'Price Analysis Report', category: 'Settlements', frequency: 'Monthly' },
  { name: 'Interconnection Queue Report', category: 'Planning', frequency: 'Monthly' },
  { name: 'Long-Term System Assessment', category: 'Planning', frequency: 'Annual' },
];

function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500">Official ERCOT reports and publications</p>
      </div>

      <Card title="Available Reports">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {reports.map((report) => (
                <tr key={report.name} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{report.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      report.category === 'Operations' ? 'bg-blue-100 text-blue-800' :
                      report.category === 'Settlements' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {report.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{report.frequency}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-ercot-accent hover:underline mr-4">View</button>
                    <button className="text-ercot-accent hover:underline">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Report Categories">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Operations</h4>
            <p className="text-sm text-blue-600 mt-1">Daily grid operations, generation, and reliability data</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Settlements</h4>
            <p className="text-sm text-green-600 mt-1">Market prices, billing, and financial reports</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">Planning</h4>
            <p className="text-sm text-purple-600 mt-1">Long-term planning, forecasts, and assessments</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default Reports;
