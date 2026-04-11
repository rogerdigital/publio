import { beforeEach, describe, expect, test, vi } from 'vitest';

import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';
import { POST } from '@/app/api/publish/route';

vi.mock('@/lib/publishers/wechat', () => ({
  WechatPublisher: vi.fn().mockImplementation(function WechatPublisher() {
    return {
    publish: vi.fn().mockResolvedValue({
      platform: 'wechat',
      success: true,
      message: '已创建公众号草稿',
      url: 'https://mp.weixin.qq.com/draft',
    }),
    };
  }),
}));

vi.mock('@/lib/publishers/zhihu', () => ({
  ZhihuPublisher: vi.fn().mockImplementation(function ZhihuPublisher() {
    return {
    publish: vi.fn().mockResolvedValue({
      platform: 'zhihu',
      success: false,
      message: '知乎登录态已过期',
    }),
    };
  }),
}));

vi.mock('@/lib/publishers/xiaohongshu', () => ({
  XiaohongshuPublisher: vi.fn().mockImplementation(function XiaohongshuPublisher() {
    return {
    publish: vi.fn().mockResolvedValue({
      platform: 'xiaohongshu',
      success: true,
      message: '已同步到小红书',
    }),
    };
  }),
}));

vi.mock('@/lib/publishers/x', () => ({
  XPublisher: vi.fn().mockImplementation(function XPublisher() {
    return {
    publish: vi.fn().mockResolvedValue({
      platform: 'x',
      success: true,
      message: '已同步到 X',
    }),
    };
  }),
}));

function createJsonRequest(body: unknown) {
  return new Request('http://localhost/api/publish', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/publish', () => {
  beforeEach(() => {
    resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-04-11T08:00:00.000Z',
    });
  });

  test('returns a sync task with per-platform receipts', async () => {
    const response = await POST(
      createJsonRequest({
        draftId: 'draft-1',
        title: '稿件标题',
        content: '稿件正文',
        platforms: ['wechat', 'zhihu'],
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.results).toEqual([
      expect.objectContaining({
        platform: 'wechat',
        status: 'success',
        message: '已创建公众号草稿',
        url: 'https://mp.weixin.qq.com/draft',
      }),
      expect.objectContaining({
        platform: 'zhihu',
        status: 'error',
        message: '知乎登录态已过期',
      }),
    ]);
    expect(json.syncTask).toMatchObject({
      id: 'sync-1',
      draftId: 'draft-1',
      title: '稿件标题',
      status: 'partial',
      receipts: [
        {
          platform: 'wechat',
          status: 'published',
          message: '已创建公众号草稿',
          url: 'https://mp.weixin.qq.com/draft',
          attempts: 1,
        },
        {
          platform: 'zhihu',
          status: 'failed',
          message: '知乎登录态已过期',
          attempts: 1,
        },
      ],
    });
  });
});
