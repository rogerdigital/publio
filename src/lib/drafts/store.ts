import type {
  ContentDraft,
  CreateDraftInput,
  DraftVersion,
  ListDraftsOptions,
  UpdateDraftInput,
} from '@/lib/drafts/types';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
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
  const drafts = new Map<string, ContentDraft>(initialDrafts.map((draft) => [draft.id, draft]));

  function persistDrafts() {
    if (!storagePath) return;
    writeMergedJsonFileCollection(storagePath, Array.from(drafts.values()), (draft) => draft.id);
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
        ...(input.topicId ? { topicId: input.topicId } : {}),
        ...(input.briefId ? { briefId: input.briefId } : {}),
        ...(input.contentGoal ? { contentGoal: input.contentGoal } : {}),
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

      // 保存版本快照（仅当标题或内容变更时）
      let versions = current.versions ?? [];
      if (input.title !== undefined || input.content !== undefined) {
        const titleChanged = input.title !== undefined && input.title !== current.title;
        const contentChanged = input.content !== undefined && input.content !== current.content;
        if (titleChanged || contentChanged) {
          const version: DraftVersion = {
            id: `v-${Date.now()}`,
            title: current.title,
            content: current.content,
            savedAt: now(),
            changeSummary: titleChanged ? '标题变更' : '内容变更',
          };
          versions = [...versions, version].slice(-20); // 最多保留 20 个版本
        }
      }

      const updated: ContentDraft = {
        ...current,
        ...input,
        versions,
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
