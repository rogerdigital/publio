import { createDraftStore } from '@/lib/drafts/store';
import type { ContentDraft } from '@/lib/drafts/types';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type DraftRegistryOptions = Parameters<typeof createDraftStore>[0];

let draftStore = createDraftStore({
  storagePath: createLocalDataPath('drafts.json'),
});

export function getDraftRegistry() {
  return draftStore;
}

export function resetDraftRegistryForTests(options: DraftRegistryOptions = {}) {
  draftStore = createDraftStore(options);
  return draftStore;
}

export type { ContentDraft };
