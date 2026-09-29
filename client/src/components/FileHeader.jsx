import React from 'react';

export default function FileHeader({
  filePath,
  basePath,
  changeKind,
  isExpanded,
  onToggle
}) {
  return (
    <div
      className="file-header-title"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      aria-label={`Toggle diff for ${filePath}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <span className="file-chevron" aria-hidden="true">
        {isExpanded ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#1C7CD6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 8 11 13 6" />
          </svg>
        ) : (
          <svg
            width="10"
            height="10"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#1C7CD6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 3 11 8 6 13" />
          </svg>
        )}
      </span>

      <span className="file-path-link">
        {changeKind === 'RENAMED' && basePath && basePath !== filePath ? (
          <>
            <span className="old-path">{basePath}</span>
            <span className="rename-arrow"> → </span>
            <span className="new-path">{filePath}</span>
          </>
        ) : (
          filePath
        )}
      </span>
    </div>
  );
}
