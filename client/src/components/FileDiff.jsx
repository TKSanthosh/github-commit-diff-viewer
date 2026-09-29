import React, { useState } from 'react';
import FileHeader from './FileHeader';
import DiffHunk from './DiffHunk';
import { detectLanguage } from '../utils/language';

export default function FileDiff({ diffItem }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!diffItem) return null;

  const { changeKind, baseFile, headFile, hunks } = diffItem;
  const currentPath = headFile?.path || baseFile?.path || 'unknown';
  const basePath = baseFile?.path;
  const language = detectLanguage(currentPath);

  const hasHunks = Array.isArray(hunks) && hunks.length > 0;

  return (
    <article className="file-diff-item" aria-label={`Diff for ${currentPath}`}>
      <FileHeader
        filePath={currentPath}
        basePath={basePath}
        changeKind={changeKind}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded((prev) => !prev)}
      />

      {isExpanded && (
        <div className="file-code-box">
          {hasHunks ? (
            <div className="diff-table-wrapper">
              <table className="diff-table">
                <colgroup>
                  <col className="diff-col-base-num" />
                  <col className="diff-col-head-num" />
                  <col className="diff-col-code" />
                </colgroup>
                {hunks.map((hunk, idx) => (
                  <DiffHunk
                    key={`${hunk.header}-${idx}`}
                    hunk={hunk}
                    language={language}
                  />
                ))}
              </table>
            </div>
          ) : (
            <div className="binary-or-empty-diff">
              <p>Binary or non-text change — no textual diff available to display.</p>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
