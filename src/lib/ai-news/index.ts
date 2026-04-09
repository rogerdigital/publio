import {
  clusterAiNewsSignals,
  type NormalizedAiNewsSignal,
} from '@/lib/ai-news/cluster';
import { fetchArticleSnapshot, type ArticleSnapshot } from '@/lib/ai-news/articleSnapshot';
import { fetchTextWithTimeout } from '@/lib/ai-news/requestTimeout';
import {
  extractItems,
  extractContentImage,
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
  const fetchedAt = new Date().toISOString();
  const xml = await fetchTextWithTimeout(source.url, {
    timeoutMs: 8000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  });

  return extractItems(xml)
    .map((block) => {
      const rawTitle = extractTagValue(block, 'title');
      const sourceName = parseSourceLabel(rawTitle, source.name);
      const link = extractLink(block);
      const imageUrl = extractContentImage(block, link);
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
        imageUrl,
        sourceWeight: source.weight,
        publishedAt,
        fetchedAt,
        sourceName,
        sourceType: source.sourceType,
        isOfficialSource: source.sourceType === 'official',
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

function shuffleCandidates(candidates: AiNewsDeskCandidate[]): AiNewsDeskCandidate[] {
  const result = [...candidates];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function diversifyCandidates(
  sorted: AiNewsDeskCandidate[],
  total: number,
  maxPerSource = 2,
): AiNewsDeskCandidate[] {
  const sourceCounts = new Map<string, number>();
  const selected: AiNewsDeskCandidate[] = [];
  const deferred: AiNewsDeskCandidate[] = [];

  for (const candidate of sorted) {
    const domain = candidate.primarySignal.sourceDomain;
    const count = sourceCounts.get(domain) ?? 0;
    if (count < maxPerSource) {
      selected.push(candidate);
      sourceCounts.set(domain, count + 1);
    } else {
      deferred.push(candidate);
    }
    if (selected.length >= total) break;
  }

  // 多样性过滤后仍不足时，从剩余候选按分数补齐
  // 输入池为 40 条，deferred 此时是真正低分备选而非单一来源堆积
  if (selected.length < total) {
    selected.push(...deferred.slice(0, total - selected.length));
  }

  return selected;
}

async function hydrateCandidateImages(candidates: AiNewsDeskCandidate[]) {  const snapshotCache = new Map<string, Promise<ArticleSnapshot>>();

  return Promise.all(
    candidates.map(async (candidate) => {
      const hasImage = candidate.researchBrief.imageUrl || candidate.primarySignal.imageUrl;
      const hasMetrics =
        typeof candidate.primarySignal.articleWordCount === 'number' ||
        typeof candidate.primarySignal.articleImageCount === 'number';

      if (hasImage && hasMetrics) {
        return candidate;
      }

      const articleLink = candidate.primarySignal.link;
      let snapshotPromise = snapshotCache.get(articleLink);
      if (!snapshotPromise) {
        snapshotPromise = fetchArticleSnapshot(articleLink);
        snapshotCache.set(articleLink, snapshotPromise);
      }

      const snapshot = await snapshotPromise;
      const imageUrl = snapshot.imageUrl || candidate.researchBrief.imageUrl || candidate.primarySignal.imageUrl;
      const articleWordCount = snapshot.wordCount ?? candidate.primarySignal.articleWordCount;
      const articleImageCount =
        snapshot.imageCount ?? candidate.primarySignal.articleImageCount;

      if (!imageUrl && typeof articleWordCount !== 'number' && typeof articleImageCount !== 'number') {
        return candidate;
      }

      return {
        ...candidate,
        primarySignal: {
          ...candidate.primarySignal,
          imageUrl,
          articleWordCount,
          articleImageCount,
        },
        signals: candidate.signals.map((signal) =>
          signal.link === articleLink &&
          (!signal.imageUrl ||
            typeof signal.articleWordCount !== 'number' ||
            typeof signal.articleImageCount !== 'number')
            ? {
                ...signal,
                imageUrl,
                articleWordCount,
                articleImageCount,
              }
            : signal,
        ),
        researchBrief: {
          ...candidate.researchBrief,
          imageUrl,
          evidence: candidate.researchBrief.evidence.map((entry) =>
            entry.link === articleLink && !entry.imageUrl
              ? {
                  ...entry,
                  imageUrl,
                }
              : entry,
          ),
        },
      };
    }),
  );
}

export async function fetchAiNewsSignals(hours = 24) {
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  const results = await Promise.allSettled(
    AI_NEWS_SOURCES.map((source) => fetchSourceSignals(source, cutoffTime)),
  );

  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

export function buildAiNewsDeskFromSignals(
  signals: NormalizedAiNewsSignal[],
  now = new Date(),
  poolSize = 16,
): AiNewsDesk {
  const candidates = clusterAiNewsSignals(signals)
    .map((cluster) => scoreAiNewsCluster(cluster, now))
    .map((cluster) => buildCandidate(cluster))
    .sort(sortCandidates)
    .slice(0, poolSize);

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

export async function buildAiNewsDesk(hours = 24, poolSize = 40) {
  const signals = await fetchAiNewsSignals(hours);
  const desk = buildAiNewsDeskFromSignals(signals, new Date(), poolSize);
  const hydratedCandidates = await hydrateCandidateImages([
    ...desk.todayCandidates,
    ...desk.followCandidates,
  ]);
  const generatedAt = new Date(desk.generatedAt);
  const candidates = shuffleCandidates(
    diversifyCandidates(
      hydratedCandidates
        .map((candidate) => scoreAiNewsCluster(candidate, generatedAt))
        .map((candidate) => buildCandidate(candidate))
        .sort(sortCandidates),
      poolSize,
    ),
  );
  const todayCandidates = candidates.filter((candidate) => candidate.bucket === 'today');
  const followCandidates = candidates.filter((candidate) => candidate.bucket === 'follow');
  const selectedResearch =
    (desk.selectedResearch
      ? candidates.find(
          (candidate) => candidate.researchBrief.candidateId === desk.selectedResearch?.candidateId,
        )?.researchBrief
      : null) ??
    todayCandidates[0]?.researchBrief ??
    followCandidates[0]?.researchBrief ??
    null;

  return {
    ...desk,
    todayCandidates,
    followCandidates,
    selectedResearch,
  };
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
