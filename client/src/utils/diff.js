/**
 * Determines whether a diff line is an addition, deletion, or context line.
 *
 * @param {Object} line - Diff line object with baseLineNumber, headLineNumber, content
 * @returns {'add'|'del'|'context'}
 */
export function getLineType(line) {
  if (!line || !line.content) return 'context';
  const prefix = line.content.charAt(0);
  if (prefix === '+') return 'add';
  if (prefix === '-') return 'del';
  return 'context';
}

/**
 * Returns human-readable label and color style for changeKind.
 *
 * @param {string} changeKind - ADDED | DELETED | MODIFIED | RENAMED | COPIED | TYPE_CHANGED
 * @returns {{ label: string, type: string }}
 */
export function getChangeKindInfo(changeKind) {
  switch (changeKind) {
    case 'ADDED':
      return { label: 'Added', type: 'add' };
    case 'DELETED':
      return { label: 'Deleted', type: 'del' };
    case 'RENAMED':
      return { label: 'Renamed', type: 'rename' };
    case 'COPIED':
      return { label: 'Copied', type: 'copy' };
    case 'TYPE_CHANGED':
      return { label: 'Type Changed', type: 'type' };
    case 'MODIFIED':
    default:
      return { label: 'Modified', type: 'mod' };
  }
}
