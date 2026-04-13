import { describe, expect, test } from 'vitest';
import { createSyncHistoryStore } from '@/lib/sync/store';

describe('sync task event log', () => {
  test('createTask appends a created event', () => {
    const store = createSyncHistoryStore({ now: () => '2024-01-01T00:00:00.000Z' });
    const task = store.createTask({ title: 'Test', platforms: ['wechat'] });

    expect(task.events).toHaveLength(1);
    expect(task.events[0]).toMatchObject({ type: 'created', timestamp: '2024-01-01T00:00:00.000Z' });
  });

  test('updateReceipt appends platform-succeeded on published status', () => {
    const store = createSyncHistoryStore({ now: () => '2024-01-01T00:00:00.000Z' });
    const task = store.createTask({ title: 'Test', platforms: ['wechat'] });

    const updated = store.updateReceipt(task.id, 'wechat', { status: 'published', message: 'ok' });

    expect(updated?.events.some((e) => e.type === 'platform-succeeded' && e.platform === 'wechat')).toBe(true);
  });

  test('updateReceipt appends platform-failed on failed status', () => {
    const store = createSyncHistoryStore({ now: () => '2024-01-01T00:00:00.000Z' });
    const task = store.createTask({ title: 'Test', platforms: ['x'] });

    const updated = store.updateReceipt(task.id, 'x', {
      status: 'failed',
      failureMessage: '授权失败',
    });

    const failEvent = updated?.events.find((e) => e.type === 'platform-failed');
    expect(failEvent).toBeDefined();
    expect(failEvent?.platform).toBe('x');
    expect(failEvent?.message).toBe('授权失败');
  });

  test('markPlatformDone appends manual-completed event', () => {
    const store = createSyncHistoryStore({ now: () => '2024-01-01T00:00:00.000Z' });
    const task = store.createTask({ title: 'Test', platforms: ['zhihu'] });
    store.updateReceipt(task.id, 'zhihu', { status: 'needs-action' });

    const done = store.markPlatformDone(task.id, 'zhihu');

    expect(done?.events.some((e) => e.type === 'manual-completed' && e.platform === 'zhihu')).toBe(true);
    expect(done?.receipts.find((r) => r.platform === 'zhihu')?.status).toBe('published');
  });

  test('appendRetryEvent appends a retried event', () => {
    const store = createSyncHistoryStore({ now: () => '2024-01-01T00:00:00.000Z' });
    const task = store.createTask({ title: 'Test', platforms: ['wechat'] });

    const updated = store.appendRetryEvent(task.id);

    expect(updated?.events.some((e) => e.type === 'retried')).toBe(true);
  });
});
