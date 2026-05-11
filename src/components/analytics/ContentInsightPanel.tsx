'use client';

import { Trophy, AlertCircle } from 'lucide-react';
import type { SyncTaskMetrics } from '@/lib/metrics/types';
import * as styles from './analytics.css';

interface ContentInsightPanelProps {
  metrics: SyncTaskMetrics[];
}

function totalEngagement(m: SyncTaskMetrics): number {
  return m.platforms.reduce(
    (s, p) => s + p.views + p.likes * 5 + p.comments * 10 + p.shares * 8,
    0,
  );
}

export default function ContentInsightPanel({ metrics }: ContentInsightPanelProps) {
  if (metrics.length === 0) return null;

  const sorted = [...metrics].sort((a, b) => totalEngagement(b) - totalEngagement(a));
  const topPerformers = sorted.slice(0, 3);
  const needsReview = sorted
    .slice(-3)
    .reverse()
    .filter((m) => totalEngagement(m) < totalEngagement(sorted[0]) * 0.2);

  return (
    <div className={styles.insightSection}>
      <div className={styles.insightBlock}>
        <h3 className={styles.insightTitle}>
          <Trophy size={14} />
          表现最佳
        </h3>
        <ul className={styles.insightList}>
          {topPerformers.map((m) => (
            <li key={m.syncTaskId} className={styles.insightItem}>
              <span className={styles.insightItemTitle}>{m.title}</span>
              <span className={styles.insightItemMeta}>
                {m.platforms.reduce((s, p) => s + p.views, 0).toLocaleString()} 阅读
              </span>
            </li>
          ))}
        </ul>
      </div>

      {needsReview.length > 0 && (
        <div className={styles.insightBlock}>
          <h3 className={styles.insightTitle}>
            <AlertCircle size={14} />
            建议复盘
          </h3>
          <ul className={styles.insightList}>
            {needsReview.map((m) => (
              <li key={m.syncTaskId} className={styles.insightItem}>
                <span className={styles.insightItemTitle}>{m.title}</span>
                <span className={styles.insightItemMeta}>
                  {m.platforms.reduce((s, p) => s + p.views, 0).toLocaleString()} 阅读
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
