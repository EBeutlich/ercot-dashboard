import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  {
    category: 'Overview',
    items: [
      { path: '/', label: 'Home', icon: '🏠' },
      { path: '/system-demand', label: 'System Demand', icon: '📊' },
    ]
  },
  {
    category: 'Pricing',
    items: [
      { path: '/real-time-prices', label: 'Real-Time Prices', icon: '💰' },
      { path: '/day-ahead-prices', label: 'Day-Ahead Prices', icon: '📅' },
      { path: '/hub-prices', label: 'Hub Prices', icon: '🔄' },
      { path: '/settlement-points', label: 'Settlement Points', icon: '📍' },
      { path: '/congestion-revenue', label: 'Congestion Revenue', icon: '💵' },
    ]
  },
  {
    category: 'Generation',
    items: [
      { path: '/generation-by-fuel', label: 'Generation by Fuel', icon: '⚡' },
      { path: '/wind-generation', label: 'Wind Generation', icon: '💨' },
      { path: '/solar-generation', label: 'Solar Generation', icon: '☀️' },
    ]
  },
  {
    category: 'Load & Forecast',
    items: [
      { path: '/load-forecast', label: 'Load Forecast', icon: '📈' },
      { path: '/weather-zones', label: 'Weather Zones', icon: '🌡️' },
      { path: '/load-zones', label: 'Load Zones', icon: '🗺️' },
    ]
  },
  {
    category: 'Grid Operations',
    items: [
      { path: '/outage-schedule', label: 'Outage Schedule', icon: '🔧' },
      { path: '/ancillary-services', label: 'Ancillary Services', icon: '⚙️' },
      { path: '/transmission-constraints', label: 'Transmission Constraints', icon: '🚧' },
      { path: '/system-frequency', label: 'System Frequency', icon: '〰️' },
      { path: '/reserve-capacity', label: 'Reserve Capacity', icon: '🔋' },
      { path: '/operating-reserves', label: 'Operating Reserves', icon: '📦' },
    ]
  },
  {
    category: 'Planning',
    items: [
      { path: '/capacity-demand-curve', label: 'Capacity Demand Curve', icon: '📉' },
      { path: '/resource-adequacy', label: 'Resource Adequacy', icon: '✅' },
    ]
  },
  {
    category: 'Alerts & Notices',
    items: [
      { path: '/emergency-alerts', label: 'Emergency Alerts', icon: '🚨' },
      { path: '/market-notices', label: 'Market Notices', icon: '📢' },
    ]
  },
  {
    category: 'Data & Reports',
    items: [
      { path: '/historical-data', label: 'Historical Data', icon: '📁' },
      { path: '/reports', label: 'Reports', icon: '📋' },
    ]
  },
  {
    category: 'Developer',
    items: [
      { path: '/dev/error-injector', label: 'Error Injector', icon: '🐛' },
      { path: '/dev/api-explorer', label: 'API Explorer', icon: '🔌' },
    ]
  },
];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`bg-ercot-primary text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} flex flex-col`}>
      {/* Logo */}
      <div className="p-4 border-b border-ercot-secondary flex items-center justify-between">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">ERCOT</h1>
            <p className="text-xs text-slate-300">Dashboard</p>
          </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-ercot-secondary rounded transition-colors"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((section) => (
          <div key={section.category} className="mb-4">
            {!collapsed && (
              <h2 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {section.category}
              </h2>
            )}
            <ul>
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 text-sm transition-colors ${
                        isActive 
                          ? 'bg-ercot-accent text-white' 
                          : 'text-slate-300 hover:bg-ercot-secondary hover:text-white'
                      }`
                    }
                    title={item.label}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      
      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-ercot-secondary text-xs text-slate-400">
          <p>Data from ERCOT MIS</p>
          <p>Updated in real-time</p>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
