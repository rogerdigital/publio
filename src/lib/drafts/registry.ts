import { createDraftStore } from '@/lib/drafts/store';
import type { ContentDraft } from '@/lib/drafts/types';

type DraftRegistryOptions = Parameters<typeof createDraftStore>[0];

let draftStore = createDraftStore();

export function getDraftRegistry() {
  return draftStore;
}

export function resetDraftRegistryForTests(options: DraftRegistryOptions = {}) {
  draftStore = createDraftStore(options);
  return draftStore;
}

export type { ContentDraft };
