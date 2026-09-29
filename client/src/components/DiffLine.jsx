import React, { memo } from 'react';
import { getLineType } from '../utils/diff';
import { highlightDiffLine } from '../utils/language';

function DiffLine({ line, language }) {
  const lineType = getLineType(line);
  const { prefix, highlightedHtml } = highlightDiffLine(line.content, language);

  let rowClassName = 'diff-line-row';
  if (lineType === 'add') {
    rowClassName += ' diff-line-add';
  } else if (lineType === 'del') {
    rowClassName += ' diff-line-del';
  } else {
    rowClassName += ' diff-line-context';
  }

  return (
    <tr className={rowClassName}>
      <td className="diff-line-num diff-base-num">
        {line.baseLineNumber !== null && line.baseLineNumber !== undefined
          ? line.baseLineNumber
          : ''}
      </td>
      <td className="diff-line-num diff-head-num">
        {line.headLineNumber !== null && line.headLineNumber !== undefined
          ? line.headLineNumber
          : ''}
      </td>
      <td className="diff-line-content">
        <span className="diff-prefix" aria-hidden="true">{prefix}</span>
        <span
          className="diff-code"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </td>
    </tr>
  );
}

export default memo(DiffLine);
