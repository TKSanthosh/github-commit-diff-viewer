import React from 'react';
import DiffLine from './DiffLine';

export default function DiffHunk({ hunk, language }) {
  if (!hunk) return null;

  return (
    <tbody className="diff-hunk-group">
      <tr className="diff-hunk-header-row">
        <td colSpan="3" className="diff-hunk-header-cell">
          <span className="hunk-header-text">{hunk.header}</span>
        </td>
      </tr>
      {hunk.lines &&
        hunk.lines.map((line, index) => (
          <DiffLine
            key={`${line.baseLineNumber || 'b'}-${line.headLineNumber || 'h'}-${index}`}
            line={line}
            language={language}
          />
        ))}
    </tbody>
  );
}
