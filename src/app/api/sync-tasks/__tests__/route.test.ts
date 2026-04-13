import { beforeEach, describe, expect, test } from 'vitest';

import { GET } from '@/app/api/sync-tasks/route';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/sync-tasks', () => {
  beforeEach(() => {
    const store = resetSyncHistoryStoreForTests({
      createId: () => 'sync-1',
      now: () => '2026-04-11T08:00:00.000Z',
    });
    store.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat'],
    });
  });

  test('lists sync tasks', async () => {
    const response = await GET();
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.syncTasks).toEqual([
      expect.objectContaining({
        id: 'sync-1',
        draftId: 'draft-1',
        title: '稿件标题',
        status: 'pending',
      }),
    ]);
  });
});
