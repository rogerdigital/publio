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
): AiNewsDeskCandidate[] {
  // 按域名分组（保留组内原有分数顺序）
  const byDomain = new Map<string, AiNewsDeskCandidate[]>();
  for (const candidate of sorted) {
    const domain = candidate.primarySignal.sourceDomain;
    const group = byDomain.get(domain) ?? [];
    group.push(candidate);
    byDomain.set(domain, group);
  }

  // 轮询：每轮从各域名各取一条，直到凑够 total
  // 保证任意域名的数量最多比其他域名多 1 条
  const selected: AiNewsDeskCandidate[] = [];
  const queues = Array.from(byDomain.values());
  let pass = 0;

  while (selected.length < total) {
    let added = false;
    for (const queue of queues) {
      if (selected.length >= total) break;
      if (queue[pass]) {
        selected.push(queue[pass]);
        added = true;
      }
    }
    if (!added) break;
    pass++;
  }

  return selected;
}

async function hydrateCandidateImages(candidates: AiNewsDeskCandidate[]) {
  const snapshotCache = new Map<string, Promise<ArticleSnapshot>>();

  function getOrFetchSnapshot(link: string): Promise<ArticleSnapshot> {
    if (!snapshotCache.has(link)) {
      snapshotCache.set(link, fetchArticleSnapshot(link));
    }
    return snapshotCache.get(link)!;
  }

  return Promise.all(
    candidates.map(async (candidate) => {
      const primaryLink = candidate.primarySignal.link;
      const hasPrimaryImage = !!(candidate.researchBrief.imageUrl || candidate.primarySignal.imageUrl);
      const hasPrimaryMetrics =
        typeof candidate.primarySignal.articleWordCount === 'number' ||
        typeof candidate.primarySignal.articleImageCount === 'number';
      const needsPrimary = !hasPrimaryImage || !hasPrimaryMetrics;

      // 最多补抓 2 条没有图片的次级信号
      const secondaryTargets = candidate.signals
        .filter((s) => s.link !== primaryLink && !s.imageUrl)
        .slice(0, 2);

      if (!needsPrimary && secondaryTargets.length === 0) {
        return candidate;
      }

      // 主信号和次级信号并行抓取
      const [primarySnapshot, ...secondarySnapshots] = await Promise.all([
        needsPrimary
          ? getOrFetchSnapshot(primaryLink)
          : Promise.resolve<ArticleSnapshot>({ imageUrl: '', imageUrls: [] }),
        ...secondaryTargets.map((s) => getOrFetchSnapshot(s.link)),
      ]);

      const primaryImageUrl = needsPrimary
        ? (primarySnapshot.imageUrl || candidate.researchBrief.imageUrl || candidate.primarySignal.imageUrl)
        : (candidate.primarySignal.imageUrl || candidate.researchBrief.imageUrl);
      const articleWordCount = needsPrimary
        ? (primarySnapshot.wordCount ?? candidate.primarySignal.articleWordCount)
        : candidate.primarySignal.articleWordCount;
      const articleImageCount = needsPrimary
        ? (primarySnapshot.imageCount ?? candidate.primarySignal.articleImageCount)
        : candidate.primarySignal.articleImageCount;

      const secondaryImageMap = new Map(
        secondaryTargets
          .map((s, i) => [s.link, secondarySnapshots[i]?.imageUrl ?? ''] as const)
          .filter(([, img]) => !!img),
      );

      if (
        !primaryImageUrl &&
        secondaryImageMap.size === 0 &&
        typeof articleWordCount !== 'number' &&
        typeof articleImageCount !== 'number'
      ) {
        return candidate;
      }

      const updatedSignals = candidate.signals.map((signal) => {
        if (signal.link === primaryLink) {
          return {
            ...signal,
            imageUrl: primaryImageUrl,
            articleImages: needsPrimary ? primarySnapshot.imageUrls : signal.articleImages,
            articleWordCount,
            articleImageCount,
          };
        }
        const secImage = secondaryImageMap.get(signal.link);
        return secImage ? { ...signal, imageUrl: secImage } : signal;
      });

      const updatedPrimary =
        updatedSignals.find((s) => s.link === primaryLink) ?? candidate.primarySignal;

      return {
        ...candidate,
        primarySignal: updatedPrimary,
        signals: updatedSignals,
        researchBrief: {
          ...candidate.researchBrief,
          imageUrl: primaryImageUrl || candidate.researchBrief.imageUrl,
          articleImages: needsPrimary
            ? primarySnapshot.imageUrls
            : candidate.researchBrief.articleImages,
          evidence: candidate.researchBrief.evidence.map((entry) => {
            if (entry.link === primaryLink) {
              return { ...entry, imageUrl: primaryImageUrl || entry.imageUrl };
            }
            const secImage = secondaryImageMap.get(entry.link);
            return secImage && !entry.imageUrl ? { ...entry, imageUrl: secImage } : entry;
          }),
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

export async function buildAiNewsDesk(hours = 24, poolSize = 40, displaySize = 10) {
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
      displaySize,
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
