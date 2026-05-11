import { beforeEach, describe, expect, test, vi } from 'vitest';

import { POST } from '@/app/api/publish/check/route';
import { resetPlatformVariantRegistryForTests } from '@/lib/platformVariants/registry';

vi.mock('@/lib/storage/envFile', () => ({
  readEnvFile: vi.fn().mockResolvedValue({
    WECHAT_APP_ID: 'test',
    WECHAT_APP_SECRET: 'test',
    XHS_APP_ID: 'test',
    XHS_APP_SECRET: 'test',
    ZHIHU_COOKIE: 'test',
    X_API_KEY: 'test',
    X_API_SECRET: 'test',
    X_ACCESS_TOKEN: 'test',
    X_ACCESS_TOKEN_SECRET: 'test',
  }),
}));

function createJsonRequest(body: unknown) {
  return new Request('http://localhost/api/publish/check', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as any;
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/publish/check', () => {
  beforeEach(() => {
    resetPlatformVariantRegistryForTests({
      createId: () => 'v-1',
      now: () => '2026-05-11T00:00:00.000Z',
    });
  });

  test('returns canPublish false when title is empty', async () => {
    const res = await POST(
      createJsonRequest({
        title: '',
        content: '正文',
        platforms: ['wechat'],
      }),
    );
    const json = await readJson(res);
    expect(res.status).toBe(200);
    expect(json.canPublish).toBe(false);
    expect(json.checks.some((c: any) => c.severity === 'error')).toBe(true);
  });

  test('returns canPublish true with valid content', async () => {
    const res = await POST(
      createJsonRequest({
        title: '有效标题',
        content: '有效正文内容',
        platforms: ['wechat'],
      }),
    );
    const json = await readJson(res);
    expect(res.status).toBe(200);
    expect(json.canPublish).toBe(true);
  });

  test('returns warning for content exceeding limits', async () => {
    const res = await POST(
      createJsonRequest({
        title: '标题',
        content: '很长'.repeat(600),
        platforms: ['xiaohongshu'],
      }),
    );
    const json = await readJson(res);
    expect(json.hasWarnings).toBe(true);
    expect(json.canPublish).toBe(true);
  });

  test('returns 400 when no platforms provided', async () => {
    const res = await POST(
      createJsonRequest({
        title: '标题',
        content: '正文',
        platforms: [],
      }),
    );
    expect(res.status).toBe(400);
  });

  test('uses variant content when variantIds provided', async () => {
    const store = resetPlatformVariantRegistryForTests({
      createId: () => 'v-xhs',
      now: () => '2026-05-11T00:00:00.000Z',
    });
    store.createVariant({
      draftId: 'draft-1',
      platform: 'xiaohongshu',
      title: '短',
      content: '短内容',
    });

    const res = await POST(
      createJsonRequest({
        title: '超长标题不影响',
        content: '超长内容不影响'.repeat(500),
        platforms: ['xiaohongshu'],
        variantIds: { xiaohongshu: 'v-xhs' },
      }),
    );
    const json = await readJson(res);

    // Variant content is short, no length warning for xiaohongshu
    const xhsLengthWarnings = json.checks.filter(
      (c: any) => c.platform === 'xiaohongshu' && c.message.includes('超出'),
    );
    expect(xhsLengthWarnings).toHaveLength(0);
  });

  test('handles missing variant gracefully', async () => {
    const res = await POST(
      createJsonRequest({
        title: '标题',
        content: '正文内容',
        platforms: ['wechat'],
        variantIds: { wechat: 'non-existent' },
      }),
    );
    const json = await readJson(res);
    expect(res.status).toBe(200);
    // Should show info about no variant
    expect(json.checks.some((c: any) => c.severity === 'info' && c.platform === 'wechat')).toBe(
      true,
    );
  });
});
