import { fetchTextWithTimeout } from '@/lib/ai-news/requestTimeout';
import { extractItems, extractTagValue, extractLink } from '@/lib/ai-news/normalize';
import { extractEntityTokens, inferTopicTags } from '@/lib/ai-news/normalize';
import { logger } from '@/lib/logger';
import type { NormalizedAiNewsSignal, AiNewsSourceType } from '@/lib/ai-news/types';

const ARXIV_FEEDS = [
  { category: 'cs.AI', name: 'arXiv AI' },
  { category: 'cs.CL', name: 'arXiv NLP' },
  { category: 'cs.LG', name: 'arXiv ML' },
];

function hashId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `arxiv-${Math.abs(hash).toString(36)}`;
}

export async function fetchArxivSignals(hours = 24): Promise<NormalizedAiNewsSignal[]> {
  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  const fetchedAt = new Date().toISOString();
  const signals: NormalizedAiNewsSignal[] = [];

  const results = await Promise.allSettled(
    ARXIV_FEEDS.map(async (feed) => {
      try {
        const xml = await fetchTextWithTimeout(`http://export.arxiv.org/rss/${feed.category}`, {
          timeoutMs: 15000,
        });

        const items = extractItems(xml);

        for (const item of items) {
          const rawLink = extractLink(item) ?? '';
          const title = (extractTagValue(item, 'title') ?? '').replace(/<[^>]+>/g, '').trim();
          const description = (extractTagValue(item, 'description') ?? '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

          if (!title || !rawLink) continue;

          const link = rawLink
            .replace(/\/abs\//, '/abs/')
            .split('?')[0]
            .split('v')[0];
          const arxivId = link.split('/abs/').pop() ?? '';
          if (!arxivId) continue;

          // arXiv RSS doesn't include reliable publish dates; use current time minus offset
          const publishedAt = new Date(
            Math.max(cutoffTime, Date.now() - hours * 30 * 60 * 1000),
          ).toISOString();

          signals.push({
            id: hashId(arxivId),
            title: title.slice(0, 200),
            canonicalTitle: title.slice(0, 80).toLowerCase(),
            summary: description.slice(0, 500) || title,
            link,
            sourceWeight: 4,
            sourceName: feed.name,
            sourceType: 'arxiv' as AiNewsSourceType,
            sourceDomain: 'arxiv.org',
            publishedAt,
            fetchedAt,
            entityTokens: extractEntityTokens(title, description.slice(0, 200)),
            topicTags: inferTopicTags(title, description.slice(0, 200)),
            isOfficialSource: false,
          });
        }
      } catch (err) {
        logger.warn(
          `arXiv fetch failed for ${feed.category}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    logger.warn(`arXiv source: ${failed}/${ARXIV_FEEDS.length} feeds failed`);
  }

  return signals;
}
