import { beforeEach, describe, expect, test, vi } from 'vitest';

import { resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';
import { POST } from '@/app/api/sync-tasks/[id]/retry/route';

vi.mock('@/lib/publishers/x', () => ({
  XPublisher: vi.fn().mockImplementation(function XPublisher() {
    return {
      publish: vi.fn().mockResolvedValue({
        platform: 'x',
        success: true,
        message: '已重新同步到 X',
        url: 'https://x.com/publio/status/1',
      }),
    };
  }),
}));

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/sync-tasks/[id]/retry', () => {
  beforeEach(() => {
    const draftStore = resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-04-11T07:00:00.000Z',
    });
    draftStore.createDraft({
      title: '稿件标题',
      content: '稿件正文',
      source: 'manual',
    });

    const timestamps = [
      '2026-04-11T08:00:00.000Z',
      '2026-04-11T08:01:00.000Z',
      '2026-04-11T08:02:00.000Z',
      '2026-04-11T08:03:00.000Z',
    ];
    const syncStore = resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => timestamps.shift() ?? '2026-04-11T08:04:00.000Z',
    });
    syncStore.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat', 'x'],
    });
    syncStore.updateReceipt('sync-1', 'wechat', {
      status: 'published',
      message: '已发布到公众号',
    });
    syncStore.updateReceipt('sync-1', 'x', {
      status: 'failed',
      message: 'X 临时失败',
    });
  });

  test('retries failed receipts with the draft content and updates the task', async () => {
    const response = await POST(
      new Request('http://localhost/api/sync-tasks/sync-1/retry', {
        method: 'POST',
      }),
      { params: Promise.resolve({ id: 'sync-1' }) },
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.syncTask).toMatchObject({
      id: 'sync-1',
      status: 'completed',
      receipts: [
        expect.objectContaining({
          platform: 'wechat',
          status: 'published',
          attempts: 1,
        }),
        expect.objectContaining({
          platform: 'x',
          status: 'published',
          message: '已重新同步到 X',
          url: 'https://x.com/publio/status/1',
          attempts: 2,
        }),
      ],
    });
    expect(json.retriedPlatforms).toEqual(['x']);
  });
});
