/**
 * Diff Parser Utility
 * Parses raw unified diff strings into the Fleet Studio OpenAPI DiffHunk schema:
 * [
 *   {
 *     header: string,
 *     lines: [
 *       {
 *         baseLineNumber: number | null,
 *         headLineNumber: number | null,
 *         content: string (prefixed with "+", "-", or " ")
 *       }
 *     ]
 *   }
 * ]
 */

const HUNK_HEADER_REGEX = /^@@\s+-(\d+)(?:,(\d+))?\s+\+(\d+)(?:,(\d+))?\s+@@(?:.*)$/;

/**
 * Parses a git unified diff patch string into an array of DiffHunk objects.
 *
 * @param {string} patch - Unified diff patch text
 * @returns {Array<{ header: string, lines: Array<{ baseLineNumber: number|null, headLineNumber: number|null, content: string }> }>}
 */
function parsePatch(patch) {
  if (!patch || typeof patch !== 'string' || patch.trim() === '') {
    return [];
  }

  const hunks = [];
  const rawLines = patch.split(/\r?\n/);

  let currentHunk = null;
  let currentBaseLine = 0;
  let currentHeadLine = 0;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // Check for hunk header
    const hunkMatch = line.match(HUNK_HEADER_REGEX);
    if (hunkMatch) {
      currentBaseLine = parseInt(hunkMatch[1], 10);
      currentHeadLine = parseInt(hunkMatch[3], 10);

      currentHunk = {
        header: line,
        lines: []
      };
      hunks.push(currentHunk);
      continue;
    }

    // If we haven't encountered a hunk header yet, ignore file headers like --- or +++
    if (!currentHunk) {
      continue;
    }

    // Git metadata lines like "\ No newline at end of file"
    if (line.startsWith('\\')) {
      continue;
    }

    if (line.startsWith('+')) {
      // Added line
      currentHunk.lines.push({
        baseLineNumber: null,
        headLineNumber: currentHeadLine,
        content: line
      });
      currentHeadLine++;
    } else if (line.startsWith('-')) {
      // Deleted line
      currentHunk.lines.push({
        baseLineNumber: currentBaseLine,
        headLineNumber: null,
        content: line
      });
      currentBaseLine++;
    } else if (line.startsWith(' ')) {
      // Unchanged context line
      currentHunk.lines.push({
        baseLineNumber: currentBaseLine,
        headLineNumber: currentHeadLine,
        content: line
      });
      currentBaseLine++;
      currentHeadLine++;
    } else if (line === '') {
      // Some diff outputs render empty context lines without leading space
      // Only treat as context line if we are within valid line ranges
      currentHunk.lines.push({
        baseLineNumber: currentBaseLine,
        headLineNumber: currentHeadLine,
        content: ' '
      });
      currentBaseLine++;
      currentHeadLine++;
    } else {
      // Fallback for non-prefixed context line
      currentHunk.lines.push({
        baseLineNumber: currentBaseLine,
        headLineNumber: currentHeadLine,
        content: ' ' + line
      });
      currentBaseLine++;
      currentHeadLine++;
    }
  }

  return hunks;
}

module.exports = {
  parsePatch,
  HUNK_HEADER_REGEX
};
