'use client';

import { useEffect, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MetricsCard from '@/components/analytics/MetricsCard';
import type { MetricsSummary } from '@/lib/metrics/types';
import * as styles from '@/components/analytics/analytics.css';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Analytics"
        title="数据看板"
        description="追踪已发布内容的阅读、互动数据。"
      />

      {loading ? (
        <div className={styles.emptyState}>加载中...</div>
      ) : summary && summary.postCount > 0 ? (
        <MetricsCard summary={summary} />
      ) : (
        <div className={styles.emptyState}>
          <BarChart3 size={32} />
          <p>暂无发布数据</p>
          <p style={{ fontSize: 13 }}>发布内容后，数据将自动回收到这里。</p>
        </div>
      )}
    </div>
  );
}
