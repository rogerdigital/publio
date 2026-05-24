import type { PlatformId } from '@/types';

export type SignalStatus = 'new' | 'saved' | 'dismissed' | 'converted';

export type SignalSourceType = 'rss' | 'url' | 'manual' | 'import' | 'x' | 'arxiv';

export interface SignalScore {
  freshness: number;
  relevance: number;
  credibility: number;
  writingPotential: number;
  audienceFit: number;
}

export interface Signal {
  id: string;
  sourceId: string;
  sourceType: SignalSourceType;
  title: string;
  summary: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  capturedAt: string;
  status: SignalStatus;
  tags: string[];
  score: SignalScore;
  notes?: string;
  recommendedPlatforms?: PlatformId[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateSignalInput {
  sourceId: string;
  sourceType: SignalSourceType;
  title: string;
  summary: string;
  url?: string;
  author?: string;
  publishedAt?: string;
  tags?: string[];
  score?: Partial<SignalScore>;
  notes?: string;
}

export type UpdateSignalInput = Partial<
  Pick<Signal, 'status' | 'tags' | 'notes' | 'score' | 'recommendedPlatforms'>
>;

export interface ListSignalsOptions {
  status?: SignalStatus;
  tag?: string;
  sourceId?: string;
  q?: string;
}
