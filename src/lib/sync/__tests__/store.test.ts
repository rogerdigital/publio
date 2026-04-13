import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createSyncHistoryStore } from '@/lib/sync/store';

describe('createSyncHistoryStore', () => {
  test('persists sync tasks to a local JSON file and restores them on restart', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'publio-sync-'));
    const storagePath = join(dataDir, 'sync-tasks.json');
    // createTask: 2 now() calls (timestamp + created-event)
    // updateReceipt: 2 now() calls (receipt updatedAt + event timestamp)
    const timestamps = [
      '2026-04-11T07:00:00.000Z', // createTask: timestamp
      '2026-04-11T07:00:00.000Z', // createTask: created event
      '2026-04-11T07:01:00.000Z', // updateReceipt: receipt updatedAt
      '2026-04-11T07:01:00.000Z', // updateReceipt: platform-succeeded event
    ];

    try {
      const store = createSyncHistoryStore({
        createId: () => 'sync-1',
        now: () => timestamps.shift() ?? '2026-04-11T07:02:00.000Z',
        storagePath,
      });

      store.createTask({
        draftId: 'draft-1',
        title: '持久化同步任务',
        platforms: ['wechat'],
      });
      store.updateReceipt('sync-1', 'wechat', {
        status: 'published',
        url: 'https://mp.weixin.qq.com/example',
      });

      const restored = createSyncHistoryStore({ storagePath });

      expect(restored.getTask('sync-1')).toMatchObject({
        id: 'sync-1',
        draftId: 'draft-1',
        title: '持久化同步任务',
        status: 'completed',
        createdAt: '2026-04-11T07:00:00.000Z',
        updatedAt: '2026-04-11T07:01:00.000Z',
        receipts: [
          expect.objectContaining({
            platform: 'wechat',
            status: 'published',
            attempts: 1,
            updatedAt: '2026-04-11T07:01:00.000Z',
            url: 'https://mp.weixin.qq.com/example',
          }),
        ],
      });
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

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

    expect(task).toMatchObject({
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
    // events array should have the created event
    expect(task.events).toHaveLength(1);
    expect(task.events[0].type).toBe('created');
  });

  test('updates a platform receipt and derives aggregate task status', () => {
    // createTask: 2 calls; each updateReceipt: 2 calls
    const timestamps = [
      '2026-04-11T07:00:00.000Z', // createTask timestamp
      '2026-04-11T07:00:00.000Z', // created event
      '2026-04-11T07:01:00.000Z', // updateReceipt wechat: receipt updatedAt
      '2026-04-11T07:01:00.000Z', // updateReceipt wechat: event
      '2026-04-11T07:02:00.000Z', // updateReceipt zhihu: receipt updatedAt
      '2026-04-11T07:02:00.000Z', // updateReceipt zhihu: event
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
      status: 'partial',
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
    // each createTask: 2 calls
    const timestamps = [
      '2026-04-11T07:00:00.000Z',
      '2026-04-11T07:00:00.000Z',
      '2026-04-11T07:01:00.000Z',
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

  test('derives needs-action when a platform requires manual handling', () => {
    const store = createSyncHistoryStore({
      createId: () => 'task-1',
      now: () => '2026-04-11T07:00:00.000Z',
    });
    store.createTask({
      draftId: 'draft-1',
      title: '稿件标题',
      platforms: ['xiaohongshu'],
    });

    const updated = store.updateReceipt('task-1', 'xiaohongshu', {
      status: 'needs-action',
      message: '请复制内容到小红书后台完成发布',
    });

    expect(updated).toMatchObject({
      id: 'task-1',
      status: 'needs-action',
      receipts: [
        expect.objectContaining({
          platform: 'xiaohongshu',
          status: 'needs-action',
          message: '请复制内容到小红书后台完成发布',
        }),
      ],
    });
  });
});
