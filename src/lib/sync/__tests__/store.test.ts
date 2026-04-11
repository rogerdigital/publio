import { describe, expect, test } from 'vitest';

import { createSyncHistoryStore } from '@/lib/sync/store';

describe('createSyncHistoryStore', () => {
  test('creates a sync task with per-platform pending receipts', () => {
    const store = createSyncHistoryStore({
      createId: () => 'task-1',
      now: () => '2026-04-11T07:00:00.000Z',
    });

    const task = store.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat', 'zhihu'],
    });

    expect(task).toEqual({
      id: 'task-1',
      draftId: 'draft-1',
      title: '稿件标题',
      status: 'pending',
      createdAt: '2026-04-11T07:00:00.000Z',
      updatedAt: '2026-04-11T07:00:00.000Z',
      receipts: [
        {
          platform: 'wechat',
          status: 'pending',
          attempts: 0,
          updatedAt: '2026-04-11T07:00:00.000Z',
        },
        {
          platform: 'zhihu',
          status: 'pending',
          attempts: 0,
          updatedAt: '2026-04-11T07:00:00.000Z',
        },
      ],
    });
  });

  test('updates a platform receipt and derives aggregate task status', () => {
    const timestamps = [
      '2026-04-11T07:00:00.000Z',
      '2026-04-11T07:01:00.000Z',
      '2026-04-11T07:02:00.000Z',
    ];
    const store = createSyncHistoryStore({
      createId: () => 'task-1',
      now: () => timestamps.shift() ?? '2026-04-11T07:03:00.000Z',
    });
    store.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['wechat', 'zhihu'],
    });

    const afterWechat = store.updateReceipt('task-1', 'wechat', {
      status: 'draft-created',
      message: '已创建公众号草稿',
      url: 'https://mp.weixin.qq.com',
    });
    const afterZhihu = store.updateReceipt('task-1', 'zhihu', {
      status: 'failed',
      message: '知乎 Cookie 已过期',
    });

    expect(afterWechat?.status).toBe('pending');
    expect(afterZhihu).toMatchObject({
      id: 'task-1',
      status: 'failed',
      updatedAt: '2026-04-11T07:02:00.000Z',
    });
    expect(afterZhihu?.receipts).toEqual([
      expect.objectContaining({
        platform: 'wechat',
        status: 'draft-created',
        message: '已创建公众号草稿',
        url: 'https://mp.weixin.qq.com',
        attempts: 1,
        updatedAt: '2026-04-11T07:01:00.000Z',
      }),
      expect.objectContaining({
        platform: 'zhihu',
        status: 'failed',
        message: '知乎 Cookie 已过期',
        attempts: 1,
        updatedAt: '2026-04-11T07:02:00.000Z',
      }),
    ]);
  });

  test('lists latest tasks first and returns null for missing task or platform', () => {
    let nextId = 1;
    const timestamps = [
      '2026-04-11T07:00:00.000Z',
      '2026-04-11T07:01:00.000Z',
    ];
    const store = createSyncHistoryStore({
      createId: () => `task-${nextId++}`,
      now: () => timestamps.shift() ?? '2026-04-11T07:02:00.000Z',
    });

    store.createTask({ draftId: 'draft-1', title: 'A', platforms: ['wechat'] });
    store.createTask({ draftId: 'draft-2', title: 'B', platforms: ['x'] });

    expect(store.listTasks().map((task) => task.id)).toEqual(['task-2', 'task-1']);
    expect(store.updateReceipt('missing', 'wechat', { status: 'failed' })).toBeNull();
    expect(store.updateReceipt('task-1', 'zhihu', { status: 'failed' })).toBeNull();
  });
});
