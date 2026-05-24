import { fetchAiNewsSignals } from '@/lib/ai-news/index';
import { persistSignalsFromDesk } from '@/lib/ai-news/persistSignals';
import { logger } from '@/lib/logger';

const RSS_FETCH_INTERVAL_MS = 30 * 60 * 1000; // 30 分钟

export async function fetchAndPersistRssSignals() {
  logger.info('Scheduled RSS fetch started');

  try {
    const signals = await fetchAiNewsSignals(24);
    const ids = persistSignalsFromDesk(signals);
    logger.info('Scheduled RSS fetch completed', {
      signalCount: signals.length,
      persistedCount: ids.length,
    });
  } catch (err) {
    logger.error('Scheduled RSS fetch failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export function getRssFetchIntervalMs() {
  return RSS_FETCH_INTERVAL_MS;
}
