import { describe, expect, test } from 'vitest';
import { POST } from '@/app/api/platforms/[platform]/connection/oauth/start/route';

function makeParams(platform: string) {
  return { params: Promise.resolve({ platform }) };
}

function makeRequest() {
  return new Request('http://localhost/api/platforms/wechat/connection/oauth/start', {
    method: 'POST',
  });
}

describe('/api/platforms/[platform]/connection/oauth/start', () => {
  test('returns 400 for unknown platform', async () => {
    const res = await POST(makeRequest() as any, makeParams('unknown') as any);
    expect(res.status).toBe(400);
  });

  test('returns 400 for manual-mode platform (zhihu)', async () => {
    const res = await POST(makeRequest() as any, makeParams('zhihu') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/手动凭证/);
  });

  test('returns 501 for oauth platform not yet implemented (wechat)', async () => {
    const res = await POST(makeRequest() as any, makeParams('wechat') as any);
    expect(res.status).toBe(501);
    const json = await res.json();
    expect(json.platform).toBe('wechat');
    expect(json.error).toBeTruthy();
  });
});
