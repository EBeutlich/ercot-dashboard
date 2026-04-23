// Simple event-based fallback notification system
// Tracks when the API falls back from Lambda to alternative methods

class FallbackNotifier {
  constructor() {
    this.listeners = new Set();
    this.lastError = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    // Immediately notify of existing error
    if (this.lastError) {
      callback(this.lastError);
    }
    return () => this.listeners.delete(callback);
  }

  notify(error) {
    this.lastError = {
      message: error.message || 'Lambda API unavailable, using fallback',
      endpoint: error.endpoint || 'unknown',
      timestamp: new Date().toISOString(),
    };
    this.listeners.forEach(cb => cb(this.lastError));
  }

  clear() {
    this.lastError = null;
    this.listeners.forEach(cb => cb(null));
  }

  getLastError() {
    return this.lastError;
  }
}

export const fallbackNotifier = new FallbackNotifier();
export default fallbackNotifier;
