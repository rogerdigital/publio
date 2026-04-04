import type { AiNewsBucket, AiNewsCluster, ScoredAiNewsCluster } from '@/lib/ai-news/types';

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function scoreFreshness(cluster: AiNewsCluster, now: Date) {
  const ageHours = Math.max(
    0,
    (now.getTime() - Date.parse(cluster.latestPublishedAt)) / (1000 * 60 * 60),
  );

  if (ageHours <= 6) {
    return 96;
  }
  if (ageHours <= 12) {
    return 88;
  }
  if (ageHours <= 24) {
    return 76;
  }
  if (ageHours <= 48) {
    return 54;
  }
  if (ageHours <= 72) {
    return 38;
  }

  return 18;
}

function scoreImpact(cluster: AiNewsCluster) {
  const topicBoost = cluster.topicTags.reduce((score, topic) => {
    switch (topic) {
      case '模型与产品发布':
        return score + 24;
      case '算力与芯片':
        return score + 22;
      case '资本与商业化':
        return score + 18;
      case '监管与治理':
        return score + 16;
      default:
        return score + 10;
    }
  }, 18);

  const entityBoost = Math.min(cluster.entityTokens.length * 3, 18);
  const coverageBoost = Math.min(cluster.coverageCount * 6, 18);

  return clamp(topicBoost + entityBoost + coverageBoost);
}

function scoreMomentum(cluster: AiNewsCluster) {
  const coverage = Math.min(cluster.coverageCount * 12, 48);
  const multiSource = cluster.signals.length >= 3 ? 14 : cluster.signals.length >= 2 ? 8 : 0;
  const freshnessAssist = Date.parse(cluster.latestPublishedAt) - Date.parse(cluster.earliestPublishedAt) <= 24 * 60 * 60 * 1000 ? 18 : 8;

  return clamp(18 + coverage + multiSource + freshnessAssist);
}

function scoreCredibility(cluster: AiNewsCluster) {
  const officialBoost = cluster.officialSourceCount > 0 ? 40 : 0;
  const mediaBoost = Math.min(cluster.mediaSourceCount * 18, 36);
  const sourceDiversityBoost =
    new Set(cluster.signals.map((signal) => signal.sourceDomain)).size >= 2 ? 12 : 4;

  return clamp(24 + officialBoost + mediaBoost + sourceDiversityBoost);
}

function resolveBucket(freshness: number): AiNewsBucket {
  return freshness >= 60 ? 'today' : 'follow';
}

export function scoreAiNewsCluster(cluster: AiNewsCluster, now = new Date()): ScoredAiNewsCluster {
  const scores = {
    freshness: scoreFreshness(cluster, now),
    impact: scoreImpact(cluster),
    momentum: scoreMomentum(cluster),
    credibility: scoreCredibility(cluster),
  };

  const totalScore = clamp(
    scores.freshness * 0.3 +
      scores.impact * 0.3 +
      scores.momentum * 0.2 +
      scores.credibility * 0.2,
  );

  return {
    ...cluster,
    scores,
    totalScore,
    bucket: resolveBucket(scores.freshness),
  };
}

export type { AiNewsCluster, ScoredAiNewsCluster };
