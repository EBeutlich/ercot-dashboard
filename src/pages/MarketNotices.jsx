import { useQuery } from '@tanstack/react-query';
import ercotApi from '../services/ercotApi';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';

function MarketNotices() {
  const { data, isLoading } = useQuery({
    queryKey: ['marketNotices'],
    queryFn: ercotApi.getMarketNotices,
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Market Notices</h1>
        <p className="text-slate-500">Official ERCOT market notices and communications</p>
      </div>

      <Card title="Recent Notices">
        <div className="space-y-4">
          {(data?.notices || []).map((notice) => (
            <div key={notice.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full mr-2 ${
                    notice.category === 'Operations' ? 'bg-blue-100 text-blue-800' :
                    notice.category === 'Settlements' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {notice.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{notice.id}</span>
                </div>
                <span className="text-sm text-slate-500">
                  {new Date(notice.timestamp).toLocaleString()}
                </span>
              </div>
              <h3 className="font-semibold mt-2">{notice.title}</h3>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Notice Categories">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800">Operations</h4>
            <p className="text-sm text-blue-600 mt-1">Grid operations, outages, and real-time conditions</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-semibold text-green-800">Settlements</h4>
            <p className="text-sm text-green-600 mt-1">Billing, payments, and financial matters</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h4 className="font-semibold text-purple-800">Planning</h4>
            <p className="text-sm text-purple-600 mt-1">Long-term planning and interconnection</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default MarketNotices;
