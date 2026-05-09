import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getDraftRegistry, resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { checkDueDrafts } from '@/lib/scheduler/checkDueDrafts';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';

vi.mock('@/lib/publishers/publishJobRunner', () => ({
  runPublishJob: vi.fn().mockResolvedValue({ syncTask: null, results: [] }),
}));

describe('checkDueDrafts', () => {
  beforeEach(() => {
    vi.mocked(runPublishJob).mockClear();
    resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
    resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-05-09T10:00:00.000Z',
    });
  });

  test('marks due drafts syncing before running the shared publish job', async () => {
    getDraftRegistry().createDraft({
      title: '稿件标题',
      content: '稿件正文',
      source: 'manual',
      scheduledAt: '2026-05-09T09:00:00.000Z',
      platforms: ['wechat'],
    });

    await checkDueDrafts();
    await checkDueDrafts();

    expect(runPublishJob).toHaveBeenCalledTimes(1);
    expect(runPublishJob).toHaveBeenCalledWith({
      syncTaskId: 'sync-1',
      title: '稿件标题',
      content: '稿件正文',
      platforms: ['wechat'],
      clearScheduledAt: true,
    });
    expect(getDraftRegistry().getDraft('draft-1')).toMatchObject({
      status: 'syncing',
    });
  });
});
