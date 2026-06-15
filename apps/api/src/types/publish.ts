import type { SyncTask } from '@/lib/sync/types';
import type { PlatformId } from './platform';

export interface PublishRequest {
  draftId?: string;
  title: string;
  content: string;
  platforms: PlatformId[];
}

export type PublishStatus = 'idle' | 'publishing' | 'success' | 'error';

export type PlatformPublishStatus =
  | 'pending'
  | 'publishing'
  | 'draft-created'
  | 'published'
  | 'needs-action'
  | 'success'
  | 'failed'
  | 'error';

export interface PlatformPublishResult {
  platform: PlatformId;
  status: PlatformPublishStatus;
  message?: string;
  url?: string;
}

export interface PublishResponse {
  syncTaskId: string;
  syncTask: SyncTask;
  results?: PlatformPublishResult[];
}
