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

import { getFeedbackStore } from '../store';

describe('feedback store', () => {
  beforeEach(() => {
    mockData.length = 0;
  });

  it('creates feedback with all fields', () => {
    const store = getFeedbackStore();
    const fb = store.createFeedback({
      draftId: 'draft-1',
      topicId: 'topic-1',
      platform: 'wechat',
      summary: 'Good engagement',
      learnings: [{ aspect: 'timing', insight: 'Morning posts perform better' }],
      nextActions: [{ type: 'timing', description: 'Post before 9am' }],
      source: 'agent',
    });
    expect(fb.id).toBeDefined();
    expect(fb.draftId).toBe('draft-1');
    expect(fb.topicId).toBe('topic-1');
    expect(fb.platform).toBe('wechat');
    expect(fb.source).toBe('agent');
    expect(fb.learnings).toHaveLength(1);
    expect(fb.nextActions).toHaveLength(1);
  });

  it('queries feedback by draft', () => {
    const store = getFeedbackStore();
    store.createFeedback({ draftId: 'draft-1', platform: 'wechat', summary: 'A' });
    store.createFeedback({ draftId: 'draft-2', platform: 'x', summary: 'B' });
    store.createFeedback({ draftId: 'draft-1', platform: 'zhihu', summary: 'C' });

    const results = store.getFeedbackByDraft('draft-1');
    expect(results).toHaveLength(2);
    expect(results.every((f) => f.draftId === 'draft-1')).toBe(true);
  });

  it('queries feedback by topic', () => {
    const store = getFeedbackStore();
    store.createFeedback({ draftId: 'd1', topicId: 'topic-A', platform: 'wechat', summary: 'X' });
    store.createFeedback({ draftId: 'd2', topicId: 'topic-B', platform: 'x', summary: 'Y' });
    store.createFeedback({ draftId: 'd3', topicId: 'topic-A', platform: 'zhihu', summary: 'Z' });

    const results = store.getFeedbackByTopic('topic-A');
    expect(results).toHaveLength(2);
  });

  it('queries feedback by platform', () => {
    const store = getFeedbackStore();
    store.createFeedback({ draftId: 'd1', platform: 'wechat', summary: 'A' });
    store.createFeedback({ draftId: 'd2', platform: 'x', summary: 'B' });

    const results = store.listFeedback({ platform: 'wechat' });
    expect(results).toHaveLength(1);
    expect(results[0].platform).toBe('wechat');
  });

  it('updates feedback', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));
    const store = getFeedbackStore();
    const fb = store.createFeedback({ draftId: 'd1', platform: 'x', summary: 'old' });
    vi.setSystemTime(new Date('2026-01-01T00:01:00Z'));
    const updated = store.updateFeedback(fb.id, { summary: 'new summary' });
    expect(updated?.summary).toBe('new summary');
    expect(updated?.updatedAt).not.toBe(fb.updatedAt);
    vi.useRealTimers();
  });

  it('returns null for non-existent update', () => {
    const store = getFeedbackStore();
    expect(store.updateFeedback('nope', { summary: 'x' })).toBeNull();
  });
});
