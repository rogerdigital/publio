import { describe, expect, test } from 'vitest';
import { inferFailureCode, toNextAction } from '@/lib/publishers/executePublish';

describe('inferFailureCode', () => {
  test('detects auth-expired from 401 in message', () => {
    expect(inferFailureCode('Request failed with status 401 Unauthorized')).toBe('auth-expired');
  });

  test('detects auth-expired from token keyword', () => {
    expect(inferFailureCode('access token has expired')).toBe('auth-expired');
  });

  test('detects rate-limited from 429', () => {
    expect(inferFailureCode('Too many requests, 429')).toBe('rate-limited');
  });

  test('detects invalid-content from content keyword', () => {
    expect(inferFailureCode('Invalid content format')).toBe('invalid-content');
  });

  test('detects network-error from timeout', () => {
    expect(inferFailureCode('Request timeout, network unreachable')).toBe('network-error');
  });

  test('returns unknown for unrecognized messages', () => {
    expect(inferFailureCode('Something went wrong')).toBe('unknown');
  });

  test('returns unknown for undefined message', () => {
    expect(inferFailureCode(undefined)).toBe('unknown');
  });
});

describe('toNextAction', () => {
  test('maps auth-expired to reconnect', () => {
    expect(toNextAction('auth-expired')).toBe('reconnect');
  });

  test('maps rate-limited to wait-and-retry', () => {
    expect(toNextAction('rate-limited')).toBe('wait-and-retry');
  });

  test('maps invalid-content to fix-content', () => {
    expect(toNextAction('invalid-content')).toBe('fix-content');
  });

  test('maps manual-required to open-platform', () => {
    expect(toNextAction('manual-required')).toBe('open-platform');
  });

  test('maps unknown to contact-support', () => {
    expect(toNextAction('unknown')).toBe('contact-support');
  });
});
