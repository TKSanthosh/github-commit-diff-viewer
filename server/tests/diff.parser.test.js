const { parsePatch } = require('../src/utils/diff.parser');

describe('diff.parser.js', () => {
  test('returns an empty array when patch is null, undefined, or empty', () => {
    expect(parsePatch(null)).toEqual([]);
    expect(parsePatch(undefined)).toEqual([]);
    expect(parsePatch('')).toEqual([]);
    expect(parsePatch('   \n  ')).toEqual([]);
  });

  test('correctly parses a single hunk with context, addition, and deletion', () => {
    const patch = [
      '@@ -5,4 +5,4 @@ import (',
      '   "fmt"',
      '-  "strings"',
      '+  "strings/v2"',
      '   "time"'
    ].join('\n');

    const hunks = parsePatch(patch);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].header).toBe('@@ -5,4 +5,4 @@ import (');

    const lines = hunks[0].lines;
    expect(lines).toHaveLength(4);

    // Line 1: context
    expect(lines[0]).toEqual({
      baseLineNumber: 5,
      headLineNumber: 5,
      content: '   "fmt"'
    });

    // Line 2: deletion
    expect(lines[1]).toEqual({
      baseLineNumber: 6,
      headLineNumber: null,
      content: '-  "strings"'
    });

    // Line 3: addition
    expect(lines[2]).toEqual({
      baseLineNumber: null,
      headLineNumber: 6,
      content: '+  "strings/v2"'
    });

    // Line 4: context
    expect(lines[3]).toEqual({
      baseLineNumber: 7,
      headLineNumber: 7,
      content: '   "time"'
    });
  });

  test('correctly handles multiple hunks within a single patch', () => {
    const patch = [
      '@@ -1,3 +1,3 @@',
      ' line 1',
      '-line 2 old',
      '+line 2 new',
      ' line 3',
      '@@ -20,3 +20,4 @@',
      ' line 20',
      '+line 20.5 inserted',
      ' line 21',
      ' line 22'
    ].join('\n');

    const hunks = parsePatch(patch);
    expect(hunks).toHaveLength(2);

    expect(hunks[0].header).toBe('@@ -1,3 +1,3 @@');
    expect(hunks[0].lines).toHaveLength(4);

    expect(hunks[1].header).toBe('@@ -20,3 +20,4 @@');
    expect(hunks[1].lines).toHaveLength(4);
    expect(hunks[1].lines[1]).toEqual({
      baseLineNumber: null,
      headLineNumber: 21,
      content: '+line 20.5 inserted'
    });
  });

  test('ignores git "\\ No newline at end of file" metadata lines', () => {
    const patch = [
      '@@ -1,2 +1,2 @@',
      '-single line without newline',
      '\\ No newline at end of file',
      '+single line with newline'
    ].join('\n');

    const hunks = parsePatch(patch);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].lines).toHaveLength(2);
    expect(hunks[0].lines[0]).toEqual({
      baseLineNumber: 1,
      headLineNumber: null,
      content: '-single line without newline'
    });
    expect(hunks[0].lines[1]).toEqual({
      baseLineNumber: null,
      headLineNumber: 1,
      content: '+single line with newline'
    });
  });

  test('normalizes empty lines without leading space as context lines', () => {
    const patch = [
      '@@ -10,3 +10,3 @@',
      ' first line',
      '',
      ' third line'
    ].join('\n');

    const hunks = parsePatch(patch);
    expect(hunks).toHaveLength(1);
    expect(hunks[0].lines).toHaveLength(3);
    expect(hunks[0].lines[1]).toEqual({
      baseLineNumber: 11,
      headLineNumber: 11,
      content: ' '
    });
  });
});
