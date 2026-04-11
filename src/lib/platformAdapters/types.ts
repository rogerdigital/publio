import type { PlatformId } from '@/types';

export type PlatformContentFormat = 'article' | 'note' | 'thread';

export interface PlatformContentDraft {
  platform: PlatformId;
  title: string;
  body: string;
  format: PlatformContentFormat;
  isReady: boolean;
  warnings: string[];
  threadParts: string[];
  suggestedTags: string[];
}

export type PlatformContentDrafts = Record<PlatformId, PlatformContentDraft>;

export interface AdaptContentInput {
  title: string;
  content: string;
  platforms: PlatformId[];
}
