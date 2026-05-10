import { describe, expect, test } from 'vitest';
import { apiResponse, apiError } from '@/lib/api/response';

describe('apiResponse', () => {
  test('returns ok with data and 200 status', async () => {
    const res = apiResponse({ drafts: [] });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.drafts).toEqual([]);
  });

  test('supports custom status', async () => {
    const res = apiResponse({ draft: { id: '1' } }, 201);
    expect(res.status).toBe(201);
  });
});

describe('apiError', () => {
  test('returns error with 400 status', async () => {
    const res = apiError('标题不能为空');
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.ok).toBe(false);
    expect(json.error).toBe('标题不能为空');
  });

  test('supports custom status and extra fields', async () => {
    const res = apiError('平台不完整', 400, { notReadyPlatforms: ['wechat'] });
    const json = await res.json();
    expect(json.notReadyPlatforms).toEqual(['wechat']);
  });
});
