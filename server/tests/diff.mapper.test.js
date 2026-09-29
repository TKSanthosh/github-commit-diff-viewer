const { mapChangeKind, mapToCombinedFileDifferences } = require('../src/mappers/diff.mapper');

describe('diff.mapper.js', () => {
  describe('mapChangeKind', () => {
    test('maps all git statuses to appropriate OpenAPI changeKind', () => {
      expect(mapChangeKind('added')).toBe('ADDED');
      expect(mapChangeKind('removed')).toBe('DELETED');
      expect(mapChangeKind('renamed')).toBe('RENAMED');
      expect(mapChangeKind('copied')).toBe('COPIED');
      expect(mapChangeKind('typechanged')).toBe('TYPE_CHANGED');
      expect(mapChangeKind('modified')).toBe('MODIFIED');
      expect(mapChangeKind('unknown')).toBe('MODIFIED');
    });
  });

  describe('mapToCombinedFileDifferences', () => {
    test('maps ADDED file correctly (baseFile null, headFile populated)', () => {
      const files = [
        {
          filename: 'src/new-feature.js',
          status: 'added',
          patch: '@@ -0,0 +1,2 @@\n+const x = 1;\n+export default x;'
        }
      ];

      const result = mapToCombinedFileDifferences(files);
      expect(result).toHaveLength(1);
      expect(result[0].changeKind).toBe('ADDED');
      expect(result[0].baseFile).toBeNull();
      expect(result[0].headFile).toEqual({ path: 'src/new-feature.js' });
      expect(result[0].hunks).toHaveLength(1);
      expect(result[0].hunks[0].lines).toHaveLength(2);
    });

    test('maps DELETED file correctly (baseFile populated, headFile null)', () => {
      const files = [
        {
          filename: 'src/deprecated.js',
          status: 'removed',
          patch: '@@ -1,2 +0,0 @@\n-const old = 1;\n-export default old;'
        }
      ];

      const result = mapToCombinedFileDifferences(files);
      expect(result).toHaveLength(1);
      expect(result[0].changeKind).toBe('DELETED');
      expect(result[0].baseFile).toEqual({ path: 'src/deprecated.js' });
      expect(result[0].headFile).toBeNull();
    });

    test('maps RENAMED file correctly with previous_filename', () => {
      const files = [
        {
          filename: 'src/utils/calc.js',
          previous_filename: 'src/math.js',
          status: 'renamed',
          patch: '@@ -1,1 +1,1 @@\n-// calc v1\n+// calc v2'
        }
      ];

      const result = mapToCombinedFileDifferences(files);
      expect(result).toHaveLength(1);
      expect(result[0].changeKind).toBe('RENAMED');
      expect(result[0].baseFile).toEqual({ path: 'src/math.js' });
      expect(result[0].headFile).toEqual({ path: 'src/utils/calc.js' });
    });

    test('maps binary / patch-less file gracefully without hunks', () => {
      const files = [
        {
          filename: 'assets/logo.png',
          status: 'added'
          // patch is omitted for binary files
        }
      ];

      const result = mapToCombinedFileDifferences(files);
      expect(result).toHaveLength(1);
      expect(result[0].changeKind).toBe('ADDED');
      expect(result[0].headFile).toEqual({ path: 'assets/logo.png' });
      expect(result[0].hunks).toEqual([]);
    });

    test('returns empty array if files is not an array', () => {
      expect(mapToCombinedFileDifferences(null)).toEqual([]);
      expect(mapToCombinedFileDifferences(undefined)).toEqual([]);
    });
  });
});
