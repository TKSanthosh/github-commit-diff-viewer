import React from 'react';

export default function LoadingState({ message = 'Loading commit details and file diffs...' }) {
  return (
    <div className="state-container loading-state">
      <div className="spinner" aria-hidden="true" />
      <p className="state-message">{message}</p>
    </div>
  );
}
