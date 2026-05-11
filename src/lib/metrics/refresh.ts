import { getMetricsStore } from './store';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { PLATFORM_FETCHERS, extractPlatformId } from './fetchers';
import type { PlatformMetrics, SyncTaskMetrics } from './types';
import type { PlatformId } from '@/types';

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

  let topicId: string | undefined;
  if (task.draftId) {
    const draftStore = getDraftRegistry();
    const draft = draftStore.getDraft(task.draftId);
    if (draft?.topicId) topicId = draft.topicId;
  }

  const metricsData: SyncTaskMetrics = {
    syncTaskId: task.id,
    draftId: task.draftId,
    topicId,
    title: task.title,
    publishedAt: task.receipts.find((r) => r.publishedAt)?.publishedAt ?? task.updatedAt,
    platforms: platformMetrics,
  };

  return getMetricsStore().upsert(metricsData);
}
