import Card from '../components/Card';

function TransmissionConstraints() {
  const constraints = [
    { name: 'West_Zone_Export', limit: 8500, actual: 7200, status: 'Normal' },
    { name: 'Houston_Import', limit: 12000, actual: 10500, status: 'Warning' },
    { name: 'North_South_Interface', limit: 6000, actual: 4800, status: 'Normal' },
    { name: 'Valley_Export', limit: 4500, actual: 4200, status: 'Warning' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transmission Constraints</h1>
        <p className="text-slate-500">Current transmission system constraints and limits</p>
      </div>

      <Card title="Active Constraints">
        <div className="space-y-4">
          {constraints.map((constraint) => {
            const percentage = (constraint.actual / constraint.limit) * 100;
            return (
              <div key={constraint.name} className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{constraint.name.replace(/_/g, ' ')}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    constraint.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {constraint.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-600">
                    {constraint.actual.toLocaleString()} / {constraint.limit.toLocaleString()} MW
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default TransmissionConstraints;
