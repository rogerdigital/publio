import { describe, expect, test } from 'vitest';

import { createDraftStore } from '@/lib/drafts/store';

describe('createDraftStore', () => {
  test('creates a manual draft with timestamps and default draft status', () => {
    const store = createDraftStore({
      createId: () => 'draft-1',
      now: () => '2026-04-11T06:00:00.000Z',
    });

    const draft = store.createDraft({
      title: '第一篇稿件',
      content: '正文内容',
      source: 'manual',
    });

    expect(draft).toEqual({
      id: 'draft-1',
      title: '第一篇稿件',
      content: '正文内容',
      status: 'draft',
      source: 'manual',
      createdAt: '2026-04-11T06:00:00.000Z',
      updatedAt: '2026-04-11T06:00:00.000Z',
    });
    expect(store.getDraft('draft-1')).toEqual(draft);
  });

  test('updates title and content without replacing immutable draft metadata', () => {
    const timestamps = [
      '2026-04-11T06:00:00.000Z',
      '2026-04-11T06:05:00.000Z',
    ];
    const store = createDraftStore({
      createId: () => 'draft-1',
      now: () => timestamps.shift() ?? '2026-04-11T06:10:00.000Z',
    });

    store.createDraft({
      title: '旧标题',
      content: '旧正文',
      source: 'ai-news',
    });

    const updated = store.updateDraft('draft-1', {
      title: '新标题',
      content: '新正文',
      status: 'ready',
    });

    expect(updated).toMatchObject({
      id: 'draft-1',
      title: '新标题',
      content: '新正文',
      status: 'ready',
      source: 'ai-news',
      createdAt: '2026-04-11T06:00:00.000Z',
      updatedAt: '2026-04-11T06:05:00.000Z',
    });
  });

  test('archives drafts and lists active drafts by most recent update first', () => {
    let nextId = 1;
    const timestamps = [
      '2026-04-11T06:00:00.000Z',
      '2026-04-11T06:01:00.000Z',
      '2026-04-11T06:02:00.000Z',
      '2026-04-11T06:03:00.000Z',
    ];
    const store = createDraftStore({
      createId: () => `draft-${nextId++}`,
      now: () => timestamps.shift() ?? '2026-04-11T06:04:00.000Z',
    });

    store.createDraft({ title: 'A', content: 'A body', source: 'manual' });
    store.createDraft({ title: 'B', content: 'B body', source: 'manual' });
    store.updateDraft('draft-1', { content: 'A body updated' });
    store.archiveDraft('draft-2');

    expect(store.listDrafts()).toEqual([
      expect.objectContaining({
        id: 'draft-1',
        content: 'A body updated',
        status: 'draft',
        updatedAt: '2026-04-11T06:02:00.000Z',
      }),
    ]);
    expect(store.listDrafts({ includeArchived: true })).toEqual([
      expect.objectContaining({ id: 'draft-2', status: 'archived' }),
      expect.objectContaining({ id: 'draft-1', status: 'draft' }),
    ]);
  });

  test('returns null when updating or archiving a missing draft', () => {
    const store = createDraftStore();

    expect(store.updateDraft('missing', { title: 'Nope' })).toBeNull();
    expect(store.archiveDraft('missing')).toBeNull();
  });
});
