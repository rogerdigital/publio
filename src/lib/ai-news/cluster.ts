import type { AiNewsCluster, NormalizedAiNewsSignal } from '@/lib/ai-news/types';

function hoursBetween(a: string, b: string) {
  return Math.abs(Date.parse(a) - Date.parse(b)) / (1000 * 60 * 60);
}

function overlapRatio(left: string[], right: string[]) {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  const shared = Array.from(leftSet).filter((token) => rightSet.has(token)).length;
  const base = Math.max(leftSet.size, rightSet.size, 1);
  return shared / base;
}

function similarity(left: NormalizedAiNewsSignal, right: NormalizedAiNewsSignal) {
  if (left.link === right.link) {
    return 1;
  }

  const titleOverlap = overlapRatio(
    left.canonicalTitle.split(/\s+/),
    right.canonicalTitle.split(/\s+/),
  );
  const entityOverlap = overlapRatio(left.entityTokens, right.entityTokens);
  const topicOverlap = overlapRatio(left.topicTags, right.topicTags);
  const timePenalty = hoursBetween(left.publishedAt, right.publishedAt) <= 72 ? 0 : 0.25;

  return titleOverlap * 0.5 + entityOverlap * 0.35 + topicOverlap * 0.15 - timePenalty;
}

function sortSignals(signals: NormalizedAiNewsSignal[]) {
  return [...signals].sort((a, b) => {
    if (Number(b.isOfficialSource) !== Number(a.isOfficialSource)) {
      return Number(b.isOfficialSource) - Number(a.isOfficialSource);
    }

    return Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
  });
}

function buildCluster(signals: NormalizedAiNewsSignal[]): AiNewsCluster {
  const sortedSignals = sortSignals(signals);
  const primarySignal = sortedSignals[0];
  const entityTokens = Array.from(new Set(sortedSignals.flatMap((signal) => signal.entityTokens)));
  const topicTags = Array.from(new Set(sortedSignals.flatMap((signal) => signal.topicTags)));
  const publishedTimes = sortedSignals.map((signal) => Date.parse(signal.publishedAt));

  return {
    clusterId: primarySignal.id,
    title: primarySignal.title,
    normalizedTitle: primarySignal.canonicalTitle,
    topicTags,
    entityTokens,
    signals: sortedSignals,
    primarySignal,
    earliestPublishedAt: new Date(Math.min(...publishedTimes)).toISOString(),
    latestPublishedAt: new Date(Math.max(...publishedTimes)).toISOString(),
    coverageCount: sortedSignals.length,
    officialSourceCount: sortedSignals.filter((signal) => signal.isOfficialSource).length,
    mediaSourceCount: sortedSignals.filter((signal) => signal.sourceType === 'media').length,
    creatorSourceCount: sortedSignals.filter((signal) => signal.creatorWeight > 0).length,
  };
}

export function clusterAiNewsSignals(signals: NormalizedAiNewsSignal[]) {
  const clusters: NormalizedAiNewsSignal[][] = [];

  sortSignals(signals).forEach((signal) => {
    const matchedCluster = clusters.find((cluster) =>
      cluster.some((existingSignal) => similarity(existingSignal, signal) >= 0.58),
    );

    if (matchedCluster) {
      matchedCluster.push(signal);
      return;
    }

    clusters.push([signal]);
  });

  return clusters
    .map((cluster) => buildCluster(cluster))
    .sort(
      (a, b) =>
        Date.parse(b.latestPublishedAt) - Date.parse(a.latestPublishedAt) ||
        b.coverageCount - a.coverageCount,
    );
}

export type { AiNewsCluster, NormalizedAiNewsSignal };
