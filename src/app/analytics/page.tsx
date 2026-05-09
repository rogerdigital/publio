'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MetricsCard from '@/components/analytics/MetricsCard';
import type { MetricsSummary } from '@/lib/metrics/types';
import * as styles from '@/components/analytics/analytics.css';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState('');

  const fetchSummary = useCallback(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (data.summary) setSummary(data.summary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleRefreshAll = async () => {
    setRefreshing(true);
    setRefreshProgress('获取任务列表...');
    try {
      const tasksRes = await fetch('/api/sync-tasks');
      const tasksData = await tasksRes.json();
      const tasks = (tasksData.syncTasks ?? tasksData.tasks ?? []) as Array<{
        id: string;
        receipts: Array<{ status: string; url?: string }>;
      }>;

      const publishedTasks = tasks.filter((t) =>
        t.receipts?.some((r) => r.status === 'published' && r.url),
      );

      if (publishedTasks.length === 0) {
        setRefreshProgress('无已发布的任务');
        return;
      }

      let done = 0;
      const results = await Promise.allSettled(
        publishedTasks.map((t) =>
          fetch('/api/metrics/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ syncTaskId: t.id }),
          }).then((r) => {
            done++;
            setRefreshProgress(`${done}/${publishedTasks.length}`);
            return r;
          }),
        ),
      );

      const succeeded = results.filter((r) => r.status === 'fulfilled').length;
      setRefreshProgress(`已完成 ${succeeded}/${publishedTasks.length}`);
      fetchSummary();
    } catch {
      setRefreshProgress('刷新失败');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Analytics"
        title="数据看板"
        description="追踪已发布内容的阅读、互动数据。"
        action={
          <button
            type="button"
            onClick={handleRefreshAll}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 8,
              border: '1px solid var(--color-border, #e5ddd5)',
              background: 'transparent',
              color: 'var(--color-text, #3d2e24)',
              fontSize: 13,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} />
            {refreshing ? refreshProgress || '刷新中...' : '刷新全部数据'}
          </button>
        }
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
