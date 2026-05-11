import { describe, it, expect, beforeEach, vi } from 'vitest';

const mockData: unknown[] = [];

vi.mock('@/lib/storage/jsonFileCollection', () => ({
  readJsonFileCollection: () => [...mockData],
  writeMergedJsonFileCollection: (_path: string, data: unknown[]) => {
    mockData.length = 0;
    mockData.push(...data);
  },
}));

vi.mock('@/lib/storage/localDataPath', () => ({
  createLocalDataPath: (name: string) => `/tmp/test-${name}`,
}));

import { getMetricsStore } from '../store';
import type { SyncTaskMetrics } from '../types';

function makeMetric(overrides: Partial<SyncTaskMetrics> = {}): SyncTaskMetrics {
  return {
    syncTaskId: `task-${Math.random().toString(36).slice(2, 8)}`,
    draftId: 'draft-1',
    topicId: 'topic-1',
    title: 'Test',
    publishedAt: '2026-01-15T10:00:00Z',
    platforms: [
      {
        platform: 'wechat',
        views: 100,
        likes: 10,
        comments: 5,
        shares: 2,
        fetchedAt: '2026-01-16T00:00:00Z',
      },
    ],
    ...overrides,
  };
}

describe('metrics store aggregation', () => {
  beforeEach(() => {
    mockData.length = 0;
  });

  it('aggregates all metrics', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1' }));
    store.upsert(makeMetric({ syncTaskId: 't2' }));

    const result = store.aggregate();
    expect(result.views).toBe(200);
    expect(result.likes).toBe(20);
    expect(result.postCount).toBe(2);
  });

  it('aggregates by topic', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1', topicId: 'topic-A' }));
    store.upsert(makeMetric({ syncTaskId: 't2', topicId: 'topic-B' }));
    store.upsert(makeMetric({ syncTaskId: 't3', topicId: 'topic-A' }));

    const byTopic = store.aggregateByTopic();
    expect(byTopic['topic-A'].postCount).toBe(2);
    expect(byTopic['topic-A'].views).toBe(200);
    expect(byTopic['topic-B'].postCount).toBe(1);
  });

  it('aggregates by platform', () => {
    const store = getMetricsStore();
    store.upsert(
      makeMetric({
        syncTaskId: 't1',
        platforms: [
          { platform: 'wechat', views: 100, likes: 10, comments: 5, shares: 2, fetchedAt: '' },
          { platform: 'x', views: 50, likes: 5, comments: 1, shares: 10, fetchedAt: '' },
        ],
      }),
    );

    const byPlatform = store.aggregateByPlatform();
    expect(byPlatform['wechat'].views).toBe(100);
    expect(byPlatform['x'].views).toBe(50);
  });

  it('filters by time range', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1', publishedAt: '2026-01-10T00:00:00Z' }));
    store.upsert(makeMetric({ syncTaskId: 't2', publishedAt: '2026-01-20T00:00:00Z' }));
    store.upsert(makeMetric({ syncTaskId: 't3', publishedAt: '2026-02-01T00:00:00Z' }));

    const result = store.aggregate({ from: '2026-01-15', to: '2026-01-31' });
    expect(result.postCount).toBe(1);
    expect(result.views).toBe(100);
  });

  it('filters by platform in aggregate', () => {
    const store = getMetricsStore();
    store.upsert(
      makeMetric({
        syncTaskId: 't1',
        platforms: [
          { platform: 'wechat', views: 100, likes: 10, comments: 5, shares: 2, fetchedAt: '' },
          { platform: 'x', views: 50, likes: 5, comments: 1, shares: 10, fetchedAt: '' },
        ],
      }),
    );

    const result = store.aggregate({ platform: 'x' });
    expect(result.views).toBe(50);
    expect(result.likes).toBe(5);
  });

  it('handles old records without topicId', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1', topicId: undefined }));

    const byTopic = store.aggregateByTopic();
    expect(byTopic['_none'].postCount).toBe(1);
  });

  it('queries by draftId', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1', draftId: 'draft-A' }));
    store.upsert(makeMetric({ syncTaskId: 't2', draftId: 'draft-B' }));

    const results = store.getByDraftId('draft-A');
    expect(results).toHaveLength(1);
    expect(results[0].draftId).toBe('draft-A');
  });

  it('queries by topicId', () => {
    const store = getMetricsStore();
    store.upsert(makeMetric({ syncTaskId: 't1', topicId: 'topic-X' }));
    store.upsert(makeMetric({ syncTaskId: 't2', topicId: 'topic-Y' }));

    const results = store.getByTopicId('topic-X');
    expect(results).toHaveLength(1);
  });
});
