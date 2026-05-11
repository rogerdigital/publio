import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { SyncTaskMetrics, MetricsSummary, AggregateMetrics, AggregateOptions } from './types';
import type { PlatformId } from '@/types';

const METRICS_FILE = createLocalDataPath('metrics.json');

function readAll(): SyncTaskMetrics[] {
  return readJsonFileCollection<SyncTaskMetrics>(METRICS_FILE);
}

function writeAll(data: SyncTaskMetrics[]) {
  writeMergedJsonFileCollection(METRICS_FILE, data, (metrics) => metrics.syncTaskId);
}

function sumPlatformMetrics(
  items: SyncTaskMetrics[],
  platformFilter?: PlatformId,
): AggregateMetrics {
  let views = 0;
  let likes = 0;
  let comments = 0;
  let shares = 0;
  for (const item of items) {
    for (const p of item.platforms) {
      if (platformFilter && p.platform !== platformFilter) continue;
      views += p.views;
      likes += p.likes;
      comments += p.comments;
      shares += p.shares;
    }
  }
  return { views, likes, comments, shares, postCount: items.length };
}

export function getMetricsStore() {
  return {
    getAll(): SyncTaskMetrics[] {
      return readAll();
    },

    getByTaskId(syncTaskId: string): SyncTaskMetrics | undefined {
      return readAll().find((m) => m.syncTaskId === syncTaskId);
    },

    getByDraftId(draftId: string): SyncTaskMetrics[] {
      return readAll().filter((m) => m.draftId === draftId);
    },

    getByTopicId(topicId: string): SyncTaskMetrics[] {
      return readAll().filter((m) => m.topicId === topicId);
    },

    upsert(data: SyncTaskMetrics): SyncTaskMetrics {
      const all = readAll();
      const index = all.findIndex((m) => m.syncTaskId === data.syncTaskId);
      if (index >= 0) {
        all[index] = data;
      } else {
        all.push(data);
      }
      writeAll(all);
      return data;
    },

    getSummary(): MetricsSummary {
      const all = readAll();
      return {
        totalViews: all.reduce((s, m) => s + m.platforms.reduce((ps, p) => ps + p.views, 0), 0),
        totalLikes: all.reduce((s, m) => s + m.platforms.reduce((ps, p) => ps + p.likes, 0), 0),
        totalComments: all.reduce(
          (s, m) => s + m.platforms.reduce((ps, p) => ps + p.comments, 0),
          0,
        ),
        totalShares: all.reduce((s, m) => s + m.platforms.reduce((ps, p) => ps + p.shares, 0), 0),
        postCount: all.length,
      };
    },

    aggregate(options?: AggregateOptions): AggregateMetrics {
      let items = readAll();
      if (options?.topicId) items = items.filter((m) => m.topicId === options.topicId);
      if (options?.from) items = items.filter((m) => m.publishedAt >= options.from!);
      if (options?.to) items = items.filter((m) => m.publishedAt <= options.to!);
      return sumPlatformMetrics(items, options?.platform);
    },

    aggregateByPlatform(): Record<string, AggregateMetrics> {
      const all = readAll();
      const result: Record<string, AggregateMetrics> = {};
      const platforms = new Set<string>();
      for (const m of all) {
        for (const p of m.platforms) platforms.add(p.platform);
      }
      for (const platform of platforms) {
        result[platform] = sumPlatformMetrics(all, platform as PlatformId);
      }
      return result;
    },

    aggregateByTopic(): Record<string, AggregateMetrics> {
      const all = readAll();
      const grouped: Record<string, SyncTaskMetrics[]> = {};
      for (const m of all) {
        const key = m.topicId ?? '_none';
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(m);
      }
      const result: Record<string, AggregateMetrics> = {};
      for (const [key, items] of Object.entries(grouped)) {
        result[key] = sumPlatformMetrics(items);
      }
      return result;
    },
  };
}
