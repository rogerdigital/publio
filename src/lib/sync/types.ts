import type { PlatformId } from '@/types';

export type SyncReceiptStatus =
  | 'pending'
  | 'syncing'
  | 'draft-created'
  | 'published'
  | 'failed'
  | 'needs-action';

export type SyncTaskStatus =
  | 'pending'
  | 'syncing'
  | 'completed'
  | 'failed'
  | 'partial'
  | 'needs-action';

export type SyncFailureCode =
  | 'auth-expired'
  | 'rate-limited'
  | 'invalid-content'
  | 'network-error'
  | 'manual-required'
  | 'unknown';

export type SyncNextAction =
  | 'reconnect'
  | 'wait-and-retry'
  | 'fix-content'
  | 'open-platform'
  | 'mark-done'
  | 'contact-support';

export type SyncEventType =
  | 'created'
  | 'platform-started'
  | 'platform-succeeded'
  | 'platform-failed'
  | 'platform-needs-action'
  | 'retried'
  | 'manual-completed';

export interface SyncEvent {
  type: SyncEventType;
  platform?: PlatformId;
  message?: string;
  timestamp: string;
}

export interface PlatformSyncReceipt {
  platform: PlatformId;
  status: SyncReceiptStatus;
  message?: string;
  url?: string;
  attempts: number;
  updatedAt: string;
  failureCode?: SyncFailureCode;
  failureMessage?: string;
  nextAction?: SyncNextAction;
}

export interface SyncTask {
  id: string;
  draftId?: string;
  title: string;
  status: SyncTaskStatus;
  receipts: PlatformSyncReceipt[];
  events: SyncEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSyncTaskInput {
  draftId?: string;
  title: string;
  platforms: PlatformId[];
}

export type UpdateSyncReceiptInput = Partial<
  Pick<PlatformSyncReceipt, 'status' | 'message' | 'url' | 'failureCode' | 'failureMessage' | 'nextAction'>
>;
