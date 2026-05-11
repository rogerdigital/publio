import type { PlatformId } from '@/types';

export interface PlatformMetrics {
  platform: PlatformId;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  fetchedAt: string;
}

export interface SyncTaskMetrics {
  syncTaskId: string;
  draftId?: string;
  variantId?: string;
  topicId?: string;
  title: string;
  publishedAt: string;
  platforms: PlatformMetrics[];
}

export interface MetricsSummary {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  postCount: number;
}

export interface AggregateMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  postCount: number;
}

export interface AggregateOptions {
  topicId?: string;
  platform?: PlatformId;
  from?: string;
  to?: string;
}
