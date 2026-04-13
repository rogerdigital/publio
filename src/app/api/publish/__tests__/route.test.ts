import { beforeEach, describe, expect, test, vi } from 'vitest';

import { resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';
import { POST } from '@/app/api/publish/route';

// Mock all publishers — actual publish happens async, tests only verify task creation
vi.mock('@/lib/publishers/wechat', () => ({
  WechatPublisher: vi.fn().mockImplementation(() => ({
    publish: vi.fn().mockResolvedValue({ platform: 'wechat', success: true, message: '草稿已创建' }),
  })),
}));
vi.mock('@/lib/publishers/zhihu', () => ({
  ZhihuPublisher: vi.fn().mockImplementation(() => ({
    publish: vi.fn().mockResolvedValue({ platform: 'zhihu', success: false, message: '登录态过期' }),
  })),
}));
vi.mock('@/lib/publishers/xiaohongshu', () => ({
  XiaohongshuPublisher: vi.fn().mockImplementation(() => ({
    publish: vi.fn().mockResolvedValue({ platform: 'xiaohongshu', success: true, message: '已同步' }),
  })),
}));
vi.mock('@/lib/publishers/x', () => ({
  XPublisher: vi.fn().mockImplementation(() => ({
    publish: vi.fn().mockResolvedValue({ platform: 'x', success: true, message: '已发布' }),
  })),
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
    const draftStore = resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-04-11T07:55:00.000Z',
    });
    draftStore.createDraft({
      title: '稿件标题',
      content: '稿件正文',
      source: 'manual',
    });
  });

  test('returns syncTaskId and an initial pending sync task immediately', async () => {
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
    expect(json.syncTaskId).toBe('sync-1');
    expect(json.syncTask).toMatchObject({
      id: 'sync-1',
      draftId: 'draft-1',
      title: '稿件标题',
      // task is returned immediately with pending receipts
      receipts: expect.arrayContaining([
        expect.objectContaining({ platform: 'wechat' }),
        expect.objectContaining({ platform: 'zhihu' }),
      ]),
    });
  });

  test('rejects requests with empty title', async () => {
    const response = await POST(
      createJsonRequest({ title: '', content: '正文', platforms: ['wechat'] }),
    );
    expect(response.status).toBe(400);
    const json = await readJson(response);
    expect(json.error).toBeTruthy();
  });

  test('rejects requests with no platforms selected', async () => {
    const response = await POST(
      createJsonRequest({ title: '标题', content: '正文', platforms: [] }),
    );
    expect(response.status).toBe(400);
  });

  test('rejects requests with incomplete platform drafts', async () => {
    const response = await POST(
      createJsonRequest({
        title: '标题',
        content: '正文',
        platforms: ['wechat'],
        platformDrafts: { wechat: { title: '', content: '' } },
      }),
    );
    expect(response.status).toBe(400);
    const json = await readJson(response);
    expect(json.notReadyPlatforms).toContain('wechat');
  });
});
