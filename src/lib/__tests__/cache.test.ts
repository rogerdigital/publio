import { describe, expect, test, vi, afterEach } from 'vitest';
import { getCached, setCache, invalidateCache, invalidateCachePrefix } from '@/lib/cache';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('cache', () => {
  test('stores and retrieves values', () => {
    setCache('key1', 'value1', 10000);
    expect(getCached<string>('key1')).toBe('value1');
  });

  test('returns undefined for expired entries', () => {
    vi.useFakeTimers();
    setCache('expiring', 'data', 1000);
    expect(getCached('expiring')).toBe('data');

    vi.advanceTimersByTime(1001);
    expect(getCached('expiring')).toBeUndefined();
    vi.useRealTimers();
  });

  test('returns undefined for missing keys', () => {
    expect(getCached('nonexistent')).toBeUndefined();
  });

  test('invalidateCache removes specific key', () => {
    setCache('a', 1, 10000);
    setCache('b', 2, 10000);
    invalidateCache('a');
    expect(getCached('a')).toBeUndefined();
    expect(getCached('b')).toBe(2);
  });

  test('invalidateCachePrefix removes matching keys', () => {
    setCache('news:a', 1, 10000);
    setCache('news:b', 2, 10000);
    setCache('other', 3, 10000);
    invalidateCachePrefix('news:');
    expect(getCached('news:a')).toBeUndefined();
    expect(getCached('news:b')).toBeUndefined();
    expect(getCached('other')).toBe(3);
  });
});
