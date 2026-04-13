import { describe, expect, test } from 'vitest';
import { POST } from '@/app/api/platforms/[platform]/connection/oauth/callback/route';

function makeParams(platform: string) {
  return { params: Promise.resolve({ platform }) };
}

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/platforms/wechat/connection/oauth/callback', {
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

  test('returns 400 when code is missing', async () => {
    const res = await POST(makeRequest({}) as any, makeParams('wechat') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/code/);
  });

  test('returns 501 for oauth platform not yet implemented (wechat)', async () => {
    const res = await POST(makeRequest({ code: 'auth-code-123' }) as any, makeParams('wechat') as any);
    expect(res.status).toBe(501);
    const json = await res.json();
    expect(json.platform).toBe('wechat');
  });
});
