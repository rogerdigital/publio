import { describe, expect, test, vi } from 'vitest';

import { fetchTextWithTimeout } from '@/lib/ai-news/requestTimeout';

describe('fetchTextWithTimeout', () => {
  test('上游请求长期不返回时会在超时后尽快失败', async () => {
    const fetchMock = vi.fn(() => new Promise(() => undefined));

    await expect(
      fetchTextWithTimeout('https://example.com/feed.xml', {
        timeoutMs: 20,
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow('timed out');

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
