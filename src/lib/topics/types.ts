import type { PlatformId } from '@/types';

export type TopicStatus =
  | 'idea'
  | 'researching'
  | 'briefed'
  | 'drafting'
  | 'published'
  | 'archived';

export interface Topic {
  id: string;
  title: string;
  angle: string;
  summary: string;
  signalIds: string[];
  status: TopicStatus;
  tags: string[];
  targetAudience?: string;
  recommendedPlatforms: PlatformId[];
  writingValue: number;
  urgency: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTopicInput {
  title: string;
  angle?: string;
  summary?: string;
  signalIds?: string[];
  tags?: string[];
  targetAudience?: string;
  recommendedPlatforms?: PlatformId[];
  writingValue?: number;
  urgency?: number;
}

export type UpdateTopicInput = Partial<
  Pick<
    Topic,
    | 'title'
    | 'angle'
    | 'summary'
    | 'status'
    | 'tags'
    | 'targetAudience'
    | 'recommendedPlatforms'
    | 'writingValue'
    | 'urgency'
  >
>;

export interface ListTopicsOptions {
  status?: TopicStatus;
  tag?: string;
  q?: string;
}
