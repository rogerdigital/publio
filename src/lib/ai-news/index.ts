import {
  clusterAiNewsSignals,
  type NormalizedAiNewsSignal,
} from '@/lib/ai-news/cluster';
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

function resolveUrl(rawUrl: string, baseUrl?: string) {
  const normalized = rawUrl.trim();

  if (!normalized) {
    return '';
  }

  try {
    return new URL(normalized, baseUrl).toString();
  } catch {
    return '';
  }
}

function extractMetaImage(html: string, pageUrl: string) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["'][^>]*>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const imageUrl = resolveUrl(match[1], pageUrl);
      if (imageUrl) {
        return imageUrl;
      }
    }
  }

  return '';
}

async function fetchArticleLeadImage(link: string) {
  try {
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return '';
    }

    const html = await response.text();
    return extractMetaImage(html, link);
  } catch {
    return '';
  }
}

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

async function hydrateCandidateImages(candidates: AiNewsDeskCandidate[]) {
  const imageCache = new Map<string, Promise<string>>();

  return Promise.all(
    candidates.map(async (candidate) => {
      if (candidate.researchBrief.imageUrl || candidate.primarySignal.imageUrl) {
        return candidate;
      }

      const articleLink = candidate.primarySignal.link;
      let imagePromise = imageCache.get(articleLink);
      if (!imagePromise) {
        imagePromise = fetchArticleLeadImage(articleLink);
        imageCache.set(articleLink, imagePromise);
      }

      const imageUrl = await imagePromise;
      if (!imageUrl) {
        return candidate;
      }

      return {
        ...candidate,
        primarySignal: {
          ...candidate.primarySignal,
          imageUrl,
        },
        signals: candidate.signals.map((signal) =>
          signal.link === articleLink && !signal.imageUrl
            ? {
                ...signal,
                imageUrl,
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
  const desk = buildAiNewsDeskFromSignals(signals);
  const candidates = await hydrateCandidateImages([
    ...desk.todayCandidates,
    ...desk.followCandidates,
  ]);
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
