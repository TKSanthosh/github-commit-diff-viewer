const { parsePatch } = require('../utils/diff.parser');

/**
 * Maps GitHub file status string to the OpenAPI changeKind enum:
 * 'ADDED' | 'COPIED' | 'DELETED' | 'MODIFIED' | 'RENAMED' | 'TYPE_CHANGED'
 *
 * @param {string} status - GitHub file status
 * @returns {string} OpenAPI changeKind
 */
function mapChangeKind(status) {
  switch (status?.toLowerCase()) {
    case 'added':
      return 'ADDED';
    case 'removed':
      return 'DELETED';
    case 'renamed':
      return 'RENAMED';
    case 'copied':
      return 'COPIED';
    case 'type_changed':
    case 'typechanged':
      return 'TYPE_CHANGED';
    case 'modified':
    case 'changed':
    default:
      return 'MODIFIED';
  }
}

/**
 * Maps GitHub files array into an array of CombinedFileDifference objects.
 *
 * @param {Array<Object>} files - Array of changed files from GitHub commit response
 * @returns {Array<Object>} Array of CombinedFileDifference objects
 */
function mapToCombinedFileDifferences(files) {
  if (!Array.isArray(files)) {
    return [];
  }

  return files.map((file) => {
    const changeKind = mapChangeKind(file.status);
    const hunks = parsePatch(file.patch);

    let baseFile = null;
    let headFile = null;

    switch (changeKind) {
      case 'ADDED':
        baseFile = null;
        headFile = { path: file.filename };
        break;

      case 'DELETED':
        baseFile = { path: file.filename };
        headFile = null;
        break;

      case 'RENAMED':
      case 'COPIED':
        baseFile = { path: file.previous_filename || file.filename };
        headFile = { path: file.filename };
        break;

      case 'TYPE_CHANGED':
      case 'MODIFIED':
      default:
        baseFile = { path: file.filename };
        headFile = { path: file.filename };
        break;
    }

    return {
      changeKind,
      baseFile,
      headFile,
      hunks
    };
  });
}

module.exports = {
  mapChangeKind,
  mapToCombinedFileDifferences
};
