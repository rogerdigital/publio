import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { SyncTaskMetrics, MetricsSummary } from './types';

const METRICS_FILE = createLocalDataPath('metrics.json');

function readAll(): SyncTaskMetrics[] {
  return readJsonFileCollection<SyncTaskMetrics>(METRICS_FILE);
}

function writeAll(data: SyncTaskMetrics[]) {
  writeJsonFileCollection(METRICS_FILE, data);
}

export function getMetricsStore() {
  return {
    getAll(): SyncTaskMetrics[] {
      return readAll();
    },

    getByTaskId(syncTaskId: string): SyncTaskMetrics | undefined {
      return readAll().find((m) => m.syncTaskId === syncTaskId);
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
        totalViews: all.reduce(
          (s, m) => s + m.platforms.reduce((ps, p) => ps + p.views, 0),
          0,
        ),
        totalLikes: all.reduce(
          (s, m) => s + m.platforms.reduce((ps, p) => ps + p.likes, 0),
          0,
        ),
        totalComments: all.reduce(
          (s, m) => s + m.platforms.reduce((ps, p) => ps + p.comments, 0),
          0,
        ),
        totalShares: all.reduce(
          (s, m) => s + m.platforms.reduce((ps, p) => ps + p.shares, 0),
          0,
        ),
        postCount: all.length,
      };
    },
  };
}
