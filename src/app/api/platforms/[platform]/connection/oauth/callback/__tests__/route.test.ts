import { describe, expect, test } from 'vitest';
import { POST } from '@/app/api/platforms/[platform]/connection/oauth/callback/route';

function makeParams(platform: string) {
  return { params: Promise.resolve({ platform }) };
}

function makeRequest(body: unknown, platform = 'wechat') {
  return new Request(`http://localhost/api/platforms/${platform}/connection/oauth/callback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/platforms/[platform]/connection/oauth/callback', () => {
  test('returns 400 for unknown platform', async () => {
    const res = await POST(makeRequest({ code: 'abc' }) as any, makeParams('unknown') as any);
    expect(res.status).toBe(400);
  });

  test('returns 400 for manual-mode platform (zhihu)', async () => {
    const res = await POST(makeRequest({ code: 'abc' }) as any, makeParams('zhihu') as any);
    expect(res.status).toBe(400);
  });

  test('returns 400 for POST to wechat (OAuth callback must use GET redirect, not POST)', async () => {
    const res = await POST(makeRequest({ code: 'auth-code-123' }, 'wechat') as any, makeParams('wechat') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  test('returns 400 for POST to xiaohongshu (OAuth callback must use GET redirect, not POST)', async () => {
    const res = await POST(makeRequest({ code: 'auth-code-123' }, 'xiaohongshu') as any, makeParams('xiaohongshu') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });
});
