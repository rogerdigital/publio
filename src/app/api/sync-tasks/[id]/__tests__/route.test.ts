import { beforeEach, describe, expect, test } from 'vitest';

import { GET } from '@/app/api/sync-tasks/[id]/route';
import { resetSyncHistoryStoreForTests } from '@/lib/sync/registry';

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/sync-tasks/[id]', () => {
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

  test('reads a sync task by id', async () => {
    const response = await GET(
      new Request('http://localhost/api/sync-tasks/sync-1'),
      { params: Promise.resolve({ id: 'sync-1' }) },
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.syncTask).toMatchObject({
      id: 'sync-1',
      draftId: 'draft-1',
      title: '稿件标题',
      status: 'pending',
    });
  });

  test('returns 404 for a missing sync task', async () => {
    const response = await GET(
      new Request('http://localhost/api/sync-tasks/missing'),
      { params: Promise.resolve({ id: 'missing' }) },
    );
    const json = await readJson(response);

    expect(response.status).toBe(404);
    expect(json.error).toBe('分发任务不存在');
  });
});
