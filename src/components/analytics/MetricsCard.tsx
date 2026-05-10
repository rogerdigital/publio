'use client';

import { Eye, ThumbsUp, MessageCircle, Share2 } from 'lucide-react';
import type { MetricsSummary } from '@/lib/metrics/types';
import * as styles from './analytics.css';

interface MetricsCardProps {
  summary: MetricsSummary;
}

export default function MetricsCard({ summary }: MetricsCardProps) {
  const stats = [
    { label: '总阅读', value: summary.totalViews, icon: Eye },
    { label: '总点赞', value: summary.totalLikes, icon: ThumbsUp },
    { label: '总评论', value: summary.totalComments, icon: MessageCircle },
    { label: '总分享', value: summary.totalShares, icon: Share2 },
  ];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardKicker}>Overview</span>
        <span className={styles.cardCount}>{summary.postCount} 篇已发布</span>
      </div>
      <div className={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.label} className={styles.statItem}>
            <stat.icon size={16} className={styles.statIcon} />
            <span className={styles.statValue}>{stat.value.toLocaleString()}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
