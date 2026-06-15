import type { PlatformId } from '@/types';

export type VariantStatus = 'synced' | 'adapted' | 'edited' | 'checked' | 'scheduled' | 'published';

export interface PlatformVariant {
  id: string;
  draftId: string;
  platform: PlatformId;
  title: string;
  content: string;
  status: VariantStatus;
  generatedByAgent: boolean;
  manuallyEdited: boolean;
  changeSummary?: string;
  lastSyncedFromDraftAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlatformVariantInput {
  draftId: string;
  platform: PlatformId;
  title: string;
  content: string;
  generatedByAgent?: boolean;
}

export interface UpdatePlatformVariantInput {
  title?: string;
  content?: string;
  status?: VariantStatus;
  generatedByAgent?: boolean;
  manuallyEdited?: boolean;
  changeSummary?: string;
}
