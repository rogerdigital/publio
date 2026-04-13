import { describe, expect, test } from 'vitest';
import { POST } from '@/app/api/platforms/[platform]/connection/oauth/start/route';

function makeParams(platform: string) {
  return { params: Promise.resolve({ platform }) };
}

function makeRequest(platform = 'wechat') {
  return new Request(`http://localhost/api/platforms/${platform}/connection/oauth/start`, {
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

  test('returns 400 for wechat with requiresManualConfig (verify-only, no OAuth redirect)', async () => {
    const res = await POST(makeRequest('wechat') as any, makeParams('wechat') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.requiresManualConfig).toBe(true);
    expect(json.message).toBeTruthy();
  });

  test('returns 400 for x with requiresManualConfig (verify-only, no OAuth redirect)', async () => {
    const res = await POST(makeRequest('x') as any, makeParams('x') as any);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.requiresManualConfig).toBe(true);
  });

  test('returns 400 for xiaohongshu when XHS_APP_ID is not configured', async () => {
    // XHS_APP_ID not set in test env → 400
    const res = await POST(makeRequest('xiaohongshu') as any, makeParams('xiaohongshu') as any);
    expect(res.status).toBe(400);
  });
});
