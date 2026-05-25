import { getCached, setCache } from '@/lib/cache';
import { apiResponse } from '@/lib/api/response';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const CACHE_TTL = 30 * 60 * 1000;

export async function GET() {
  const cacheKey = 'ai-news-desk';

  // 1. 内存缓存
  const cached = getCached<Record<string, unknown>>(cacheKey);
  if (cached) {
    return apiResponse(cached);
  }

  // 2. 读预计算文件
  try {
    const { readPreComputedDesk } = await import('@/lib/scheduler/fetchRssFeeds');
    const data = readPreComputedDesk();

    if (!data) {
      return apiResponse({
        generatedAt: '',
        totalSignals: 0,
        totalCandidates: 0,
        todayCandidates: [],
        followCandidates: [],
        selectedResearch: null,
        signalIds: [],
      });
    }

    setCache(cacheKey, data, CACHE_TTL);
    return apiResponse(data);
  } catch (error) {
    logger.error('AI news desk read failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiResponse({
      generatedAt: '',
      totalSignals: 0,
      totalCandidates: 0,
      todayCandidates: [],
      followCandidates: [],
      selectedResearch: null,
      signalIds: [],
    });
  }
}
