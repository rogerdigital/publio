import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getDraftRegistry, resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import { publishToPlatforms } from '@/lib/publishers/executePublish';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';

vi.mock('@/lib/publishers/executePublish', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/publishers/executePublish')>();
  return {
    ...actual,
    publishToPlatforms: vi.fn(),
  };
});

describe('runPublishJob', () => {
  beforeEach(() => {
    vi.mocked(publishToPlatforms).mockReset();
    const drafts = resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
    drafts.createDraft({
      title: '稿件标题',
      content: '稿件正文',
      source: 'manual',
      platforms: ['wechat'],
    });
    resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
  });

  test('updates receipts and draft status through the shared path', async () => {
    vi.mocked(publishToPlatforms).mockResolvedValueOnce([
      {
        platform: 'wechat',
        status: 'success',
        message: '发布成功',
        url: 'https://example.com/post',
      },
    ]);

    const syncStore = resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
    const task = syncStore.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat'],
    });

    const result = await runPublishJob({
      syncTaskId: task.id,
      title: '稿件标题',
      content: '稿件正文',
      platforms: ['wechat'],
    });

    expect(result.syncTask.status).toBe('completed');
    expect(result.syncTask.receipts[0]).toMatchObject({
      platform: 'wechat',
      status: 'published',
      url: 'https://example.com/post',
    });
    expect(getDraftRegistry().getDraft('draft-1')).toMatchObject({
      status: 'synced',
    });
  });

  test('marks all requested platforms failed when execution throws', async () => {
    vi.mocked(publishToPlatforms).mockRejectedValueOnce(new Error('network down'));
    const syncStore = resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
    const task = syncStore.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat', 'x'],
    });

    const result = await runPublishJob({
      syncTaskId: task.id,
      title: '稿件标题',
      content: '稿件正文',
      platforms: ['wechat', 'x'],
    });

    expect(result.syncTask.status).toBe('failed');
    expect(result.syncTask.receipts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          platform: 'wechat',
          status: 'failed',
          failureCode: 'network-error',
        }),
        expect.objectContaining({
          platform: 'x',
          status: 'failed',
          failureCode: 'network-error',
        }),
      ]),
    );
  });
});
