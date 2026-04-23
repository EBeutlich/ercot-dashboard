import { useState, useEffect } from 'react';
import FallbackNotification from './FallbackNotification';

function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">ERCOT Market Information System</h2>
          <p className="text-sm text-slate-500">Electric Reliability Council of Texas</p>
        </div>
        <div className="flex items-center gap-4">
          <FallbackNotification />
          <div className="text-right">
            <p className="text-sm font-medium text-slate-800">
              {currentTime.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-lg font-mono text-ercot-accent">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit',
                hour12: true 
              })} CST
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
