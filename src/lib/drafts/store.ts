import type {
  ContentDraft,
  CreateDraftInput,
  ListDraftsOptions,
  UpdateDraftInput,
} from '@/lib/drafts/types';
import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface DraftStoreOptions {
  createId?: () => string;
  now?: () => string;
  initialDrafts?: ContentDraft[];
  storagePath?: string;
}

function createDefaultId() {
  return `draft-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function sortByUpdatedAtDesc(left: ContentDraft, right: ContentDraft) {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

export function createDraftStore(options: DraftStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const initialDrafts = storagePath
    ? readJsonFileCollection<ContentDraft>(storagePath)
    : (options.initialDrafts ?? []);
  const drafts = new Map<string, ContentDraft>(
    initialDrafts.map((draft) => [draft.id, draft]),
  );

  function persistDrafts() {
    if (!storagePath) return;
    writeJsonFileCollection(storagePath, Array.from(drafts.values()));
  }

  return {
    createDraft(input: CreateDraftInput) {
      const timestamp = now();
      const draft: ContentDraft = {
        id: createId(),
        title: input.title,
        content: input.content,
        status: 'draft',
        source: input.source,
        ...(input.topicClusterId ? { topicClusterId: input.topicClusterId } : {}),
        ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
        ...(input.platforms ? { platforms: input.platforms } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      drafts.set(draft.id, draft);
      persistDrafts();
      return draft;
    },

    getDraft(id: string) {
      return drafts.get(id) ?? null;
    },

    updateDraft(id: string, input: UpdateDraftInput) {
      const current = drafts.get(id);
      if (!current) return null;

      const updated: ContentDraft = {
        ...current,
        ...input,
        updatedAt: now(),
      };

      drafts.set(id, updated);
      persistDrafts();
      return updated;
    },

    archiveDraft(id: string) {
      return this.updateDraft(id, { status: 'archived' });
    },

    listDrafts(options: ListDraftsOptions = {}) {
      return Array.from(drafts.values())
        .filter((draft) => options.includeArchived || draft.status !== 'archived')
        .sort(sortByUpdatedAtDesc);
    },
  };
}

export type { ContentDraft };
