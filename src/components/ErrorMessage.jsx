import PropTypes from 'prop-types';

function ErrorMessage({ message, error, onRetry }) {
  // Extract detailed error information
  const getErrorDetails = () => {
    if (!error) return null;

    const details = [];

    // Network error (no response from server)
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      details.push('Unable to reach the server. Please check your internet connection.');
    }

    // Timeout error
    if (error.code === 'ECONNABORTED' || error.code === 'ERR_TIMEOUT') {
      details.push('Request timed out. The server took too long to respond.');
    }

    // HTTP status errors
    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText;
      details.push(`HTTP ${status}: ${statusText}`);

      if (status === 401 || status === 403) {
        details.push('Authentication or authorization issue.');
      } else if (status === 404) {
        details.push('The requested resource was not found.');
      } else if (status === 429) {
        details.push('Too many requests. Please wait before trying again.');
      } else if (status >= 500) {
        details.push('Server error. The ERCOT API may be temporarily unavailable.');
      }
    }

    // DNS/Connection refused errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      details.push('Could not connect to the server. The service may be down.');
    }

    // Add request URL if available
    if (error.config?.url) {
      details.push(`Endpoint: ${error.config.url}`);
    }

    // Add error code if present
    if (error.code && !details.some(d => d.includes(error.code))) {
      details.push(`Error code: ${error.code}`);
    }

    return details.length > 0 ? details : null;
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="text-center">
        <p className="text-red-600 font-medium mb-2">
          {message || 'An error occurred while loading data.'}
        </p>
      </div>

      {errorDetails && errorDetails.length > 0 && (
        <div className="mt-4 bg-red-100 rounded p-4 text-left">
          <p className="text-red-800 text-sm font-medium mb-2">Error Details:</p>
          <ul className="text-red-700 text-sm space-y-1">
            {errorDetails.map((detail) => (
              <li key={detail} className="flex items-start">
                <span className="mr-2">•</span>
                <span className="break-all">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onRetry && (
        <div className="text-center mt-4">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string,
  error: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
    response: PropTypes.shape({
      status: PropTypes.number,
      statusText: PropTypes.string,
    }),
    config: PropTypes.shape({
      url: PropTypes.string,
    }),
  }),
  onRetry: PropTypes.func,
};

export default ErrorMessage;
