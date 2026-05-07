import { buildAiNewsDesk } from '@/lib/aiNews';
import { getCached, setCache } from '@/lib/cache';
import { apiResponse, apiError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const DISPLAY_SIZE = 10;
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟

export async function GET() {
  const cacheKey = 'ai-news-desk';
  const cached = getCached<Record<string, unknown>>(cacheKey);
  if (cached) {
    logger.debug('AI news cache hit');
    return apiResponse(cached);
  }

  try {
    const desk = await buildAiNewsDesk(24, 40, DISPLAY_SIZE);

    const data = {
      generatedAt: desk.generatedAt,
      totalSignals: desk.totalSignals,
      totalCandidates: desk.totalCandidates,
      todayCandidates: desk.todayCandidates,
      followCandidates: desk.followCandidates,
      selectedResearch: desk.selectedResearch,
    };

    setCache(cacheKey, data, CACHE_TTL);
    logger.info('AI news desk built', { totalSignals: desk.totalSignals });

    return apiResponse(data);
  } catch (error) {
    logger.error('AI news build failed', { error: error instanceof Error ? error.message : String(error) });
    return apiError(
      error instanceof Error ? error.message : 'Failed to fetch AI news.',
      500,
    );
  }
}
