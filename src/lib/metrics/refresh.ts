import { getMetricsStore } from './store';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { PLATFORM_FETCHERS, extractPlatformId } from './fetchers';
import type { PlatformMetrics, SyncTaskMetrics } from './types';
import type { PlatformId } from '@/types';

/**
 * Refresh metrics for a single sync task by fetching from all published platforms.
 */
export async function refreshMetricsForTask(syncTaskId: string): Promise<SyncTaskMetrics | null> {
  const syncStore = getSyncHistoryStore();
  const task = syncStore.getTask(syncTaskId);
  if (!task) return null;

  const platformMetrics: PlatformMetrics[] = [];

  for (const receipt of task.receipts) {
    if (receipt.status !== 'published' || !receipt.url) continue;

    const fetcher = PLATFORM_FETCHERS[receipt.platform as PlatformId];
    if (!fetcher) continue;

    const contentId = extractPlatformId(receipt.platform as PlatformId, receipt.url);
    if (!contentId) continue;

    try {
      const metrics = await fetcher(contentId);
      platformMetrics.push({
        platform: receipt.platform as PlatformId,
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        shares: metrics.shares,
        fetchedAt: metrics.fetchedAt,
      });
    } catch {
      // Skip failed platforms, continue with others
    }
  }

  if (platformMetrics.length === 0) return null;

  const metricsData: SyncTaskMetrics = {
    syncTaskId: task.id,
    draftId: task.draftId,
    title: task.title,
    publishedAt: task.receipts.find((r) => r.publishedAt)?.publishedAt ?? task.updatedAt,
    platforms: platformMetrics,
  };

  return getMetricsStore().upsert(metricsData);
}
