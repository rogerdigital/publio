import sanitizeHtml from 'sanitize-html';
import { describe, expect, test } from 'vitest';

describe('sanitize-html security behavior', () => {
  test('drops disallowed xmp raw-text content instead of re-emitting live markup', () => {
    expect(sanitizeHtml('<xmp><script>alert(1)</script></xmp>')).toBe('');
    expect(sanitizeHtml('<xmp><img src=x onerror=alert(1)></xmp>')).toBe('');
    expect(sanitizeHtml('<xmp><svg><script>alert(1)</script></svg></xmp>')).toBe('');
  });
});
