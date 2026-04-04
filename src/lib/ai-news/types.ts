export type AiNewsSourceType = 'media' | 'official' | 'community';

export interface AiNewsSource {
  name: string;
  url: string;
  sourceType: AiNewsSourceType;
  weight: number;
  isOfficialSource?: boolean;
}

export interface NormalizedAiNewsSignal {
  id: string;
  title: string;
  canonicalTitle: string;
  summary: string;
  link: string;
  sourceName: string;
  sourceType: AiNewsSourceType;
  sourceDomain: string;
  publishedAt: string;
  fetchedAt: string;
  entityTokens: string[];
  topicTags: string[];
  isOfficialSource: boolean;
}

export interface AiNewsCluster {
  clusterId: string;
  title: string;
  normalizedTitle: string;
  topicTags: string[];
  entityTokens: string[];
  signals: NormalizedAiNewsSignal[];
  primarySignal: NormalizedAiNewsSignal;
  earliestPublishedAt: string;
  latestPublishedAt: string;
  coverageCount: number;
  officialSourceCount: number;
  mediaSourceCount: number;
}

export interface AiNewsScores {
  freshness: number;
  impact: number;
  momentum: number;
  credibility: number;
}

export type AiNewsBucket = 'today' | 'follow';

export interface ScoredAiNewsCluster extends AiNewsCluster {
  scores: AiNewsScores;
  totalScore: number;
  bucket: AiNewsBucket;
}

export interface ResearchAngle {
  label: string;
  reason: string;
}

export interface ResearchEvidence {
  label: string;
  sourceName: string;
  link: string;
  publishedAt: string;
  sourceType: AiNewsSourceType;
}

export interface ResearchBrief {
  candidateId: string;
  title: string;
  bucket: AiNewsBucket;
  whatHappened: string;
  whyItMatters: string;
  whoIsAffected: string[];
  recommendedAngles: ResearchAngle[];
  background: string[];
  evidence: ResearchEvidence[];
  scores: AiNewsScores;
  totalScore: number;
}

export interface AiNewsDeskCandidate extends ScoredAiNewsCluster {
  whyNow: string;
  affectedSummary: string;
  angleSummary: string;
  researchBrief: ResearchBrief;
}

export interface AiNewsDesk {
  generatedAt: string;
  totalSignals: number;
  totalCandidates: number;
  todayCandidates: AiNewsDeskCandidate[];
  followCandidates: AiNewsDeskCandidate[];
  selectedResearch: ResearchBrief | null;
}
