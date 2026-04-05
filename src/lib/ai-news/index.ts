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

interface ArticleSnapshot {
  imageUrl: string;
  wordCount?: number;
  imageCount?: number;
}

function stripHtml(value: string) {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function countArticleWords(html: string) {
  const mainMatch =
    html.match(/<article\b[\s\S]*?<\/article>/i) ||
    html.match(/<main\b[\s\S]*?<\/main>/i) ||
    html.match(/<body\b[\s\S]*?<\/body>/i);
  const text = stripHtml(mainMatch?.[0] || html);

  if (!text) {
    return undefined;
  }

  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinTokens = text
    .replace(/[\u4e00-\u9fff]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const total = chineseChars + latinTokens;

  return total > 0 ? total : undefined;
}

function countArticleImages(html: string) {
  const mainMatch =
    html.match(/<article\b[\s\S]*?<\/article>/i) ||
    html.match(/<main\b[\s\S]*?<\/main>/i) ||
    html.match(/<body\b[\s\S]*?<\/body>/i);
  const scope = mainMatch?.[0] || html;
  const imageMatches = scope.match(/<img\b[^>]*>/gi) || [];

  return imageMatches.length > 0 ? imageMatches.length : undefined;
}

async function fetchArticleSnapshot(link: string): Promise<ArticleSnapshot> {
  try {
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PublioBot/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        imageUrl: '',
      };
    }

    const html = await response.text();
    return {
      imageUrl: extractMetaImage(html, link),
      wordCount: countArticleWords(html),
      imageCount: countArticleImages(html),
    };
  } catch {
    return {
      imageUrl: '',
    };
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
  const snapshotCache = new Map<string, Promise<ArticleSnapshot>>();

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
        snapshot.imageCount ??
        candidate.primarySignal.articleImageCount ??
        (imageUrl ? 1 : undefined);

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
