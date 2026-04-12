import { beforeEach, describe, expect, test } from 'vitest';

import { resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';
import { POST } from '@/app/api/sync-tasks/[id]/mark-done/route';

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/sync-tasks/[id]/mark-done', () => {
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
    ];
    const syncStore = resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => timestamps.shift() ?? '2026-04-11T08:03:00.000Z',
    });
    syncStore.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['xiaohongshu'],
    });
    syncStore.updateReceipt('sync-1', 'xiaohongshu', {
      status: 'needs-action',
      message: '请复制内容到小红书后台完成发布',
    });
  });

  test('marks a needs-action receipt as published', async () => {
    const response = await POST(
      new Request('http://localhost/api/sync-tasks/sync-1/mark-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'xiaohongshu' }),
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
          platform: 'xiaohongshu',
          status: 'published',
          message: '已手动确认完成',
        }),
      ],
    });
  });
});
