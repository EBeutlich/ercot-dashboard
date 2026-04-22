import { useQuery } from '@tanstack/react-query';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function EmergencyAlerts() {
  const { data, isLoading } = useQuery({
    queryKey: ['emergencyAlerts'],
    queryFn: ercotApi.getEmergencyAlerts,
    refetchInterval: 30000,
  });

  if (isLoading) return <LoadingSpinner />;

  const currentAlert = data?.alerts?.[0] || { level: 'Normal', message: 'Grid operating normally' };

  const alertLevels = [
    { level: 'Normal', color: 'bg-green-100 text-green-800 border-green-300', icon: '✅' },
    { level: 'Watch', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '👀' },
    { level: 'Advisory', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '⚠️' },
    { level: 'EEA Level 1', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🔶' },
    { level: 'EEA Level 2', color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴' },
    { level: 'EEA Level 3', color: 'bg-red-200 text-red-900 border-red-400', icon: '🚨' },
  ];

  const currentAlertStyle = alertLevels.find(a => a.level === currentAlert.level) || alertLevels[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Emergency Alerts</h1>
        <p className="text-slate-500">ERCOT grid emergency status and alerts</p>
      </div>

      <div className={`p-6 rounded-lg border-2 ${currentAlertStyle.color}`}>
        <div className="flex items-center">
          <span className="text-4xl mr-4">{currentAlertStyle.icon}</span>
          <div>
            <h2 className="text-2xl font-bold">{currentAlert.level}</h2>
            <p className="mt-1">{currentAlert.message}</p>
            <p className="text-sm mt-2 opacity-75">
              Last updated: {new Date(currentAlert.timestamp || Date.now()).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <Card title="Alert Levels Explained">
        <div className="space-y-3">
          {alertLevels.map((alert) => (
            <div key={alert.level} className={`p-3 rounded border ${alert.color}`}>
              <div className="flex items-center">
                <span className="text-xl mr-3">{alert.icon}</span>
                <div>
                  <span className="font-semibold">{alert.level}</span>
                  <p className="text-sm opacity-75">
                    {alert.level === 'Normal' && 'Grid operating with adequate reserves'}
                    {alert.level === 'Watch' && 'Monitoring conditions, reserves may be tight'}
                    {alert.level === 'Advisory' && 'Conservation requested, reserves declining'}
                    {alert.level === 'EEA Level 1' && 'Energy Emergency Alert - All resources deployed'}
                    {alert.level === 'EEA Level 2' && 'Public conservation appeal issued'}
                    {alert.level === 'EEA Level 3' && 'Rotating outages may be necessary'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default EmergencyAlerts;
