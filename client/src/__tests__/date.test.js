import { describe, it, expect } from 'vitest';
import { formatRelativeTime } from '../utils/date';

describe('formatRelativeTime', () => {
  it('returns empty string for invalid dates', () => {
    expect(formatRelativeTime(null)).toBe('');
    expect(formatRelativeTime('invalid-date')).toBe('');
  });

  it('formats recent timestamps as "just now"', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('just now');
  });

  it('formats dates in the past appropriately', () => {
    const now = Date.now();
    const fourDaysAgo = new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(fourDaysAgo)).toBe('four days ago');

    const yesterday = new Date(now - 1 * 24 * 60 * 60 * 1000).toISOString();
    expect(formatRelativeTime(yesterday)).toBe('yesterday');
  });
});
