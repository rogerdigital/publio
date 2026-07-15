import { describe, expect, it } from 'vitest';

import { createDraftStore } from '@/lib/drafts/store';
import type { ContentDraft } from '@/lib/drafts/types';

const initialTimestamp = '2026-07-15T00:00:00.000Z';
const updatedTimestamp = '2026-07-15T00:01:00.000Z';

function createStore(initialDrafts?: ContentDraft[]) {
  const timestamps = [initialTimestamp, updatedTimestamp];

  return createDraftStore({
    createId: () => 'draft-1',
    now: () => timestamps.shift() ?? updatedTimestamp,
    ...(initialDrafts ? { initialDrafts } : {}),
  });
}

function createDraft() {
  return createStore().createDraft({
    title: 'Original title',
    content: 'Original content',
    source: 'manual',
  });
}

describe('createDraftStore revisions', () => {
  it('starts a new draft at revision 1', () => {
    expect(createDraft().revision).toBe(1);
  });

  it('retains the revision for a metadata-only status update', () => {
    const store = createStore();
    const draft = store.createDraft({
      title: 'Original title',
      content: 'Original content',
      source: 'manual',
    });

    expect(store.updateDraft(draft.id, { status: 'ready' })?.revision).toBe(1);
  });

  it('retains the revision when setting the title to the same value', () => {
    const store = createStore();
    const draft = store.createDraft({
      title: 'Original title',
      content: 'Original content',
      source: 'manual',
    });

    expect(store.updateDraft(draft.id, { title: draft.title })?.revision).toBe(1);
  });

  it('increments the revision for an actual content change', () => {
    const store = createStore();
    const draft = store.createDraft({
      title: 'Original title',
      content: 'Original content',
      source: 'manual',
    });

    expect(store.updateDraft(draft.id, { content: 'Updated content' })?.revision).toBe(2);
  });

  it('normalizes a legacy initial draft without a revision to revision 1', () => {
    const legacyDraft = {
      id: 'legacy-draft',
      title: 'Legacy title',
      content: 'Legacy content',
      status: 'draft',
      source: 'manual',
      createdAt: initialTimestamp,
      updatedAt: initialTimestamp,
    } as ContentDraft;
    const store = createStore([legacyDraft]);

    expect(store.getDraft(legacyDraft.id)?.revision).toBe(1);
  });
});
