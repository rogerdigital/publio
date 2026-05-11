import type { PlatformId } from '@/types';

export interface FeedbackLearning {
  aspect: string;
  insight: string;
}

export interface FeedbackNextAction {
  type: 'topic' | 'writing' | 'timing' | 'platform' | 'other';
  description: string;
}

export interface Feedback {
  id: string;
  draftId: string;
  variantId?: string;
  topicId?: string;
  platform: PlatformId;
  metricSnapshotId?: string;
  summary: string;
  learnings: FeedbackLearning[];
  nextActions: FeedbackNextAction[];
  source: 'manual' | 'agent';
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackInput {
  draftId: string;
  variantId?: string;
  topicId?: string;
  platform: PlatformId;
  metricSnapshotId?: string;
  summary: string;
  learnings?: FeedbackLearning[];
  nextActions?: FeedbackNextAction[];
  source?: 'manual' | 'agent';
}

export interface UpdateFeedbackInput {
  summary?: string;
  learnings?: FeedbackLearning[];
  nextActions?: FeedbackNextAction[];
}

export interface ListFeedbackOptions {
  draftId?: string;
  topicId?: string;
  platform?: PlatformId;
}
