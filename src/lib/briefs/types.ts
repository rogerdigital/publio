import type { PlatformId } from '@/types';

export interface BriefOutlineItem {
  heading: string;
  purpose: string;
  evidenceSignalIds: string[];
}

export interface BriefSourceLink {
  title: string;
  url: string;
  signalId?: string;
}

export interface BriefPlatformPlan {
  platform: PlatformId;
  intent: string;
  estimatedLength: number;
}

export interface Brief {
  id: string;
  topicId: string;
  workingTitle: string;
  thesis: string;
  audience: string;
  tone: string;
  outline: BriefOutlineItem[];
  sourceLinks: BriefSourceLink[];
  platformPlan: BriefPlatformPlan[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateBriefInput {
  topicId: string;
  workingTitle?: string;
  thesis?: string;
  audience?: string;
  tone?: string;
  outline?: BriefOutlineItem[];
  sourceLinks?: BriefSourceLink[];
  platformPlan?: BriefPlatformPlan[];
}

export interface UpdateBriefInput {
  workingTitle?: string;
  thesis?: string;
  audience?: string;
  tone?: string;
  outline?: BriefOutlineItem[];
  sourceLinks?: BriefSourceLink[];
  platformPlan?: BriefPlatformPlan[];
}

export interface ListBriefsOptions {
  topicId?: string;
}
