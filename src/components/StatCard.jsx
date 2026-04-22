function StatCard({ title, value, unit, trend, trendDirection = 'up', icon }) {
  const trendColor = trendDirection === 'up' ? 'text-green-500' : 'text-red-500';
  const trendIcon = trendDirection === 'up' ? '↑' : '↓';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${trendColor}`}>
              {trendIcon} {trend}
            </p>
          )}
        </div>
        {icon && (
          <div className="text-4xl">{icon}</div>
        )}
      </div>
    </div>
  );
}

export default StatCard;
