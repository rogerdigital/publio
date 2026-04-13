import type { SyncTask } from '@/lib/sync/types';

export type PlatformId = 'wechat' | 'xiaohongshu' | 'zhihu' | 'x';

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string;
  enabled: boolean;
}

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

export const PLATFORMS: Platform[] = [
  { id: 'wechat', name: '微信公众号', icon: 'MessageSquare', enabled: true },
  { id: 'xiaohongshu', name: '小红书', icon: 'BookOpen', enabled: true },
  { id: 'zhihu', name: '知乎', icon: 'GraduationCap', enabled: true },
  { id: 'x', name: 'X (Twitter)', icon: 'Twitter', enabled: true },
];
