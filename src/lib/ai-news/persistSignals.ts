import { getSignalRegistry } from '@/lib/signals/registry';
import type { CreateSignalInput } from '@/lib/signals/types';
import type { NormalizedAiNewsSignal } from '@/lib/ai-news/types';

function mapSourceType(aiNewsSourceType: string): CreateSignalInput['sourceType'] {
  if (aiNewsSourceType === 'x') return 'x';
  if (aiNewsSourceType === 'arxiv') return 'arxiv';
  return 'rss';
}

function normalizeScore(sourceWeight: number): number {
  return Math.min(sourceWeight / 10, 1);
}

export function convertToSignalInput(item: NormalizedAiNewsSignal): CreateSignalInput {
  return {
    sourceId: item.sourceDomain,
    sourceType: mapSourceType(item.sourceType),
    title: item.title,
    summary: item.summary,
    url: item.link || undefined,
    author: item.sourceName,
    publishedAt: item.publishedAt,
    tags: item.topicTags.slice(0, 10),
    score: {
      freshness: 0,
      relevance: 0,
      credibility: normalizeScore(item.sourceWeight),
      writingPotential: 0,
      audienceFit: 0,
    },
  };
}

export function persistSignalsFromDesk(signals: NormalizedAiNewsSignal[]): string[] {
  const registry = getSignalRegistry();
  const signalIds: string[] = [];

  for (const item of signals) {
    const persisted = registry.upsertSignalFromFeedItem(convertToSignalInput(item));
    signalIds.push(persisted.id);
  }

  return signalIds;
}
