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
  | 'partial';

export interface PlatformSyncReceipt {
  platform: PlatformId;
  status: SyncReceiptStatus;
  message?: string;
  url?: string;
  attempts: number;
  updatedAt: string;
}

export interface SyncTask {
  id: string;
  draftId?: string;
  title: string;
  status: SyncTaskStatus;
  receipts: PlatformSyncReceipt[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSyncTaskInput {
  draftId?: string;
  title: string;
  platforms: PlatformId[];
}

export type UpdateSyncReceiptInput = Partial<
  Pick<PlatformSyncReceipt, 'status' | 'message' | 'url'>
>;
