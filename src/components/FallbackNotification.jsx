import { useState, useEffect } from 'react';
import { fallbackNotifier } from '../services/fallbackNotifier';

function FallbackNotification() {
  const [error, setError] = useState(fallbackNotifier.getLastError());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = fallbackNotifier.subscribe(setError);
    return unsubscribe;
  }, []);

  const handleClear = (e) => {
    e.stopPropagation();
    fallbackNotifier.clear();
  };

  const handleDownload = (e) => {
    e.stopPropagation();
    const errorText = `ERCOT Dashboard Error Report
================================
Timestamp: ${error.timestamp}
Endpoint: ${error.endpoint}
Message: ${error.message}

Generated: ${new Date().toISOString()}
`;
    const blob = new Blob([errorText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `error-${error.endpoint}-${new Date().toISOString().slice(0, 19).replaceAll(':', '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!error) return null;

  return (
    <div className="relative">
      {/* Error Icon Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
        title="API Fallback Warning"
      >
        <svg
          className="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </button>

      {/* Expanded Error Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border border-red-200 z-50">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="font-semibold text-red-800">API Fallback Active</h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleDownload}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Download error"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </button>
                <button
                  onClick={handleClear}
                  className="text-slate-400 hover:text-slate-600 p-1"
                  title="Dismiss"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              {error.message}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Endpoint: {error.endpoint}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {new Date(error.timestamp).toLocaleTimeString()}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Data may be less reliable or delayed. Check Lambda API configuration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FallbackNotification;
