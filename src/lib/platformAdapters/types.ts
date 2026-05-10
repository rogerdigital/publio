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
  /** AI 适配后的内容（优先于 body 使用） */
  aiBody?: string;
  /** 是否已经过 AI 适配 */
  aiAdapted?: boolean;
  /** AI 适配前的原始 body（用于回退） */
  originalBody?: string;
}

export type PlatformContentDrafts = Record<PlatformId, PlatformContentDraft>;

export interface AdaptContentInput {
  title: string;
  content: string;
  platforms: PlatformId[];
}
