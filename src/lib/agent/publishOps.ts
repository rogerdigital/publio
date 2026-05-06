import type { PlatformId } from '@/types';
import type { SyncTask } from '@/lib/sync/types';

export interface PublishHistoryStats {
  totalPublished: number;
  byPlatform: Record<string, number>;
  byHour: Record<number, number>;
  byDayOfWeek: Record<number, number>;
  recentFailures: Array<{
    platform: PlatformId;
    failureCode?: string;
    failureMessage?: string;
    timestamp: string;
  }>;
}

/**
 * Aggregate publish history from sync tasks for timing suggestions and diagnostics.
 */
export function aggregatePublishHistory(tasks: SyncTask[]): PublishHistoryStats {
  const stats: PublishHistoryStats = {
    totalPublished: 0,
    byPlatform: {},
    byHour: {},
    byDayOfWeek: {},
    recentFailures: [],
  };

  for (const task of tasks) {
    for (const receipt of task.receipts) {
      if (receipt.status === 'published' && receipt.publishedAt) {
        stats.totalPublished++;
        stats.byPlatform[receipt.platform] = (stats.byPlatform[receipt.platform] || 0) + 1;

        const date = new Date(receipt.publishedAt);
        if (!Number.isNaN(date.getTime())) {
          const hour = date.getHours();
          const day = date.getDay();
          stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
          stats.byDayOfWeek[day] = (stats.byDayOfWeek[day] || 0) + 1;
        }
      }

      if (receipt.status === 'failed') {
        stats.recentFailures.push({
          platform: receipt.platform,
          failureCode: receipt.failureCode,
          failureMessage: receipt.failureMessage,
          timestamp: receipt.updatedAt,
        });
      }
    }
  }

  // Keep only recent failures (last 20)
  stats.recentFailures.sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp));
  stats.recentFailures = stats.recentFailures.slice(0, 20);

  return stats;
}

/**
 * Generate simple timing suggestions based on publish history.
 * Returns top 3 recommended hours to publish.
 */
export function suggestPublishTiming(stats: PublishHistoryStats): string[] {
  const suggestions: string[] = [];

  if (stats.totalPublished < 3) {
    suggestions.push('发布记录较少，建议工作日 9:00-10:00 或 20:00-21:00 发布');
    return suggestions;
  }

  // Find peak hours
  const hourEntries = Object.entries(stats.byHour)
    .map(([hour, count]) => ({ hour: Number(hour), count }))
    .sort((a, b) => b.count - a.count);

  if (hourEntries.length > 0) {
    const top = hourEntries.slice(0, 3);
    const hours = top.map((h) => `${h.hour}:00`).join('、');
    suggestions.push(`历史高频发布时段：${hours}`);
  }

  // Day of week pattern
  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const dayEntries = Object.entries(stats.byDayOfWeek)
    .map(([day, count]) => ({ day: Number(day), count }))
    .sort((a, b) => b.count - a.count);

  if (dayEntries.length > 0) {
    const topDays = dayEntries.slice(0, 3).map((d) => dayNames[d.day]).join('、');
    suggestions.push(`活跃日：${topDays}`);
  }

  return suggestions;
}
