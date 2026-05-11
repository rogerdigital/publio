'use client';

import type { AggregateMetrics } from '@/lib/metrics/types';
import * as styles from './analytics.css';

interface TopicPerformanceTableProps {
  byTopic: Record<string, AggregateMetrics>;
  byPlatform: Record<string, AggregateMetrics>;
}

const PLATFORM_LABELS: Record<string, string> = {
  wechat: '微信',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X',
};

export default function TopicPerformanceTable({ byTopic, byPlatform }: TopicPerformanceTableProps) {
  const topicEntries = Object.entries(byTopic).filter(([k]) => k !== '_none');
  const platformEntries = Object.entries(byPlatform);

  if (topicEntries.length === 0 && platformEntries.length === 0) return null;

  return (
    <div className={styles.insightSection}>
      {platformEntries.length > 0 && (
        <div className={styles.insightBlock}>
          <h3 className={styles.insightTitle}>渠道表现</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>渠道</th>
                <th>发布</th>
                <th>阅读</th>
                <th>点赞</th>
                <th>评论</th>
                <th>分享</th>
              </tr>
            </thead>
            <tbody>
              {platformEntries.map(([platform, agg]) => (
                <tr key={platform}>
                  <td>{PLATFORM_LABELS[platform] || platform}</td>
                  <td>{agg.postCount}</td>
                  <td>{agg.views.toLocaleString()}</td>
                  <td>{agg.likes.toLocaleString()}</td>
                  <td>{agg.comments.toLocaleString()}</td>
                  <td>{agg.shares.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topicEntries.length > 0 && (
        <div className={styles.insightBlock}>
          <h3 className={styles.insightTitle}>选题表现</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>选题</th>
                <th>发布</th>
                <th>阅读</th>
                <th>互动</th>
              </tr>
            </thead>
            <tbody>
              {topicEntries
                .sort(([, a], [, b]) => b.views - a.views)
                .map(([topicId, agg]) => (
                  <tr key={topicId}>
                    <td className={styles.topicIdCell}>{topicId.slice(0, 8)}</td>
                    <td>{agg.postCount}</td>
                    <td>{agg.views.toLocaleString()}</td>
                    <td>{(agg.likes + agg.comments + agg.shares).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
