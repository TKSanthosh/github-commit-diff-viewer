import React from 'react';

export default function EmptyDiffState() {
  return (
    <div className="state-container empty-diff-state">
      <p className="empty-title">No file differences</p>
      <p className="empty-description">
        This commit does not contain any file changes or differences to display.
      </p>
    </div>
  );
}
