import {
  clusterAiNewsSignals,
  type NormalizedAiNewsSignal,
} from '@/lib/ai-news/cluster';
import {
  extractItems,
  extractLink,
  extractTagValue,
  normalizeAiNewsSignal,
  parseSourceLabel,
} from '@/lib/ai-news/normalize';
import { buildResearchBrief } from '@/lib/ai-news/research';
import { scoreAiNewsCluster } from '@/lib/ai-news/score';
import { AI_NEWS_SOURCES } from '@/lib/ai-news/sources';
import type {
  AiNewsDesk,
  AiNewsDeskCandidate,
  AiNewsSource,
  ResearchBrief,
} from '@/lib/ai-news/types';

async function fetchSourceSignals(source: AiNewsSource, cutoffTime: number) {
  const response = await fetch(source.url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${source.name}: ${response.status}`);
  }

  const fetchedAt = new Date().toISOString();
  const xml = await response.text();

  return extractItems(xml)
    .map((block) => {
      const rawTitle = extractTagValue(block, 'title');
      const sourceName = parseSourceLabel(rawTitle, source.name);
      const link = extractLink(block);
      const publishedAt =
        extractTagValue(block, 'pubDate') ||
        extractTagValue(block, 'published') ||
        extractTagValue(block, 'updated');
      const summary =
        extractTagValue(block, 'description') || extractTagValue(block, 'summary');

      const normalized = normalizeAiNewsSignal({
        title: rawTitle,
        summary,
        link,
        publishedAt,
        fetchedAt,
        sourceName,
        sourceType: source.sourceType,
        isOfficialSource: source.isOfficialSource ?? source.sourceType === 'official',
      });

      return normalized;
    })
    .filter((signal): signal is NormalizedAiNewsSignal => {
      if (!signal) {
        return false;
      }

      const publishedTime = Date.parse(signal.publishedAt);
      return Number.isFinite(publishedTime) && publishedTime >= cutoffTime;
    });
}

function buildCandidate(cluster: ReturnType<typeof scoreAiNewsCluster>): AiNewsDeskCandidate {
  const researchBrief = buildResearchBrief(cluster);

  return {
    ...cluster,
    whyNow: researchBrief.whyItMatters,
    affectedSummary: researchBrief.whoIsAffected.slice(0, 3).join('、'),
    angleSummary: researchBrief.recommendedAngles[0]?.label ?? '新闻解读型',
    researchBrief,
  };
}

function sortCandidates(left: AiNewsDeskCandidate, right: AiNewsDeskCandidate) {
  if (right.totalScore !== left.totalScore) {
    return right.totalScore - left.totalScore;
  }

  return Date.parse(right.latestPublishedAt) - Date.parse(left.latestPublishedAt);
}

export async function fetchAiNewsSignals(hours = 72) {
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  const results = await Promise.allSettled(
    AI_NEWS_SOURCES.map((source) => fetchSourceSignals(source, cutoffTime)),
  );

  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

export function buildAiNewsDeskFromSignals(
  signals: NormalizedAiNewsSignal[],
  now = new Date(),
): AiNewsDesk {
  const candidates = clusterAiNewsSignals(signals)
    .map((cluster) => scoreAiNewsCluster(cluster, now))
    .map((cluster) => buildCandidate(cluster))
    .sort(sortCandidates)
    .slice(0, 16);

  const todayCandidates = candidates.filter((candidate) => candidate.bucket === 'today');
  const followCandidates = candidates.filter((candidate) => candidate.bucket === 'follow');
  const selectedResearch =
    todayCandidates[0]?.researchBrief ?? followCandidates[0]?.researchBrief ?? null;

  return {
    generatedAt: now.toISOString(),
    totalSignals: signals.length,
    totalCandidates: candidates.length,
    todayCandidates,
    followCandidates,
    selectedResearch,
  };
}

export async function buildAiNewsDesk(hours = 72) {
  const signals = await fetchAiNewsSignals(hours);
  return buildAiNewsDeskFromSignals(signals);
}

export function buildResearchBriefIndex(candidates: AiNewsDeskCandidate[]): ResearchBrief[] {
  return candidates.map((candidate) => candidate.researchBrief);
}

export type {
  AiNewsDesk,
  AiNewsDeskCandidate,
  AiNewsSource,
  NormalizedAiNewsSignal,
  ResearchBrief,
};
