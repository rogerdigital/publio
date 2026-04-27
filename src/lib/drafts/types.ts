import type { PlatformId } from '@/types';

export type DraftStatus =
  | 'draft'
  | 'ready'
  | 'syncing'
  | 'synced'
  | 'failed'
  | 'archived';

export type DraftSource = 'manual' | 'ai-news' | 'import';

export interface ContentDraft {
  id: string;
  title: string;
  content: string;
  status: DraftStatus;
  source: DraftSource;
  topicClusterId?: string;
  scheduledAt?: string;
  platforms?: PlatformId[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateDraftInput {
  title: string;
  content: string;
  source: DraftSource;
  topicClusterId?: string;
  scheduledAt?: string;
  platforms?: PlatformId[];
}

export type UpdateDraftInput = Partial<
  Pick<ContentDraft, 'title' | 'content' | 'status' | 'scheduledAt' | 'platforms'>
>;

export interface ListDraftsOptions {
  includeArchived?: boolean;
}
