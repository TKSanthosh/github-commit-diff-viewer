import React from 'react';

export default function ErrorState({ error, onRetry }) {
  const is404 = error?.status === 404 || error?.code === 'NOT_FOUND';
  const is400 = error?.status === 400 || error?.code === 'INVALID_COMMIT_SHA';
  const isRateLimit = error?.status === 429 || error?.code === 'RATE_LIMIT_EXCEEDED';
  const isNetwork = error?.code === 'NETWORK_ERROR';

  let title = 'An Error Occurred';
  let description = error?.message || 'Failed to load commit data.';

  if (is400) {
    title = 'Invalid Commit SHA';
    description =
      error?.message || 'The specified commit SHA must be a 40-character hexadecimal string.';
  } else if (is404) {
    title = 'Commit or Repository Not Found';
    description =
      error?.message || 'The requested repository or commit could not be found on GitHub.';
  } else if (isRateLimit) {
    title = 'GitHub API Rate Limit Reached';
    description =
      error?.message ||
      'The GitHub API hourly rate limit for unauthenticated requests has been exceeded. Please provide a GITHUB_TOKEN in your backend .env file.';
  } else if (isNetwork) {
    title = 'Connection Error';
    description =
      'Could not reach the backend server at http://localhost:5000. Please ensure the Express backend is running.';
  }

  return (
    <div className="state-container error-state" role="alert">
      <div className="error-icon" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cf222e" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2 className="error-title">{title}</h2>
      <p className="error-description">{description}</p>
      {onRetry && (
        <button type="button" className="retry-btn" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
}
