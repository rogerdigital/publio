'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Inbox,
  Lightbulb,
  FileText,
  Send,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import * as styles from './TodayWorkbench.css';

interface WorkbenchCounts {
  newSignals: number;
  activeTopics: number;
  pendingBriefs: number;
  readyVariants: number;
  failedTasks: number;
  needsReview: number;
}

export default function TodayWorkbench() {
  const [counts, setCounts] = useState<WorkbenchCounts | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [signalsRes, topicsRes, briefsRes, variantsRes, tasksRes, metricsRes] =
          await Promise.allSettled([
            fetch('/api/signals?status=new').then((r) => r.json()),
            fetch('/api/topics?status=researching').then((r) => r.json()),
            fetch('/api/briefs').then((r) => r.json()),
            fetch('/api/platform-variants?status=checked').then((r) => r.json()),
            fetch('/api/sync-tasks?status=failed').then((r) => r.json()),
            fetch('/api/metrics').then((r) => r.json()),
          ]);

        const newSignals =
          signalsRes.status === 'fulfilled' ? (signalsRes.value.signals?.length ?? 0) : 0;
        const activeTopics =
          topicsRes.status === 'fulfilled' ? (topicsRes.value.topics?.length ?? 0) : 0;
        const pendingBriefs =
          briefsRes.status === 'fulfilled'
            ? (briefsRes.value.briefs?.filter(
                (b: { thesis?: string; outline?: unknown[] }) =>
                  !b.thesis && (!b.outline || (b.outline as unknown[]).length === 0),
              ).length ?? 0)
            : 0;
        const readyVariants =
          variantsRes.status === 'fulfilled' ? (variantsRes.value.variants?.length ?? 0) : 0;
        const failedTasks =
          tasksRes.status === 'fulfilled' ? (tasksRes.value.syncTasks?.length ?? 0) : 0;
        const publishedCount =
          metricsRes.status === 'fulfilled' ? (metricsRes.value.summary?.postCount ?? 0) : 0;
        const feedbackRes = await fetch('/api/feedback')
          .then((r) => r.json())
          .catch(() => ({ feedback: [] }));
        const needsReview = Math.max(0, publishedCount - (feedbackRes.feedback?.length ?? 0));

        setCounts({
          newSignals,
          activeTopics,
          pendingBriefs,
          readyVariants,
          failedTasks,
          needsReview,
        });
      } catch {
        // workbench is supplementary, fail silently
      }
    }
    load();
  }, []);

  if (!counts) return null;

  const totalItems =
    counts.newSignals +
    counts.activeTopics +
    counts.pendingBriefs +
    counts.readyVariants +
    counts.failedTasks +
    counts.needsReview;

  if (totalItems === 0) return null;

  const items = [
    { icon: Inbox, label: '待处理信号', count: counts.newSignals, href: '/ai-news' },
    { icon: Lightbulb, label: '进行中选题', count: counts.activeTopics, href: '/ai-news' },
    { icon: FileText, label: '待写 Brief', count: counts.pendingBriefs, href: '/ai-news' },
    { icon: Send, label: '待发布内容', count: counts.readyVariants, href: '/' },
    { icon: AlertTriangle, label: '失败任务', count: counts.failedTasks, href: '/sync-tasks' },
    { icon: BarChart3, label: '待复盘内容', count: counts.needsReview, href: '/analytics' },
  ].filter((item) => item.count > 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>
          <Inbox size={14} />
          今日工作台
        </span>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {!collapsed && (
        <div className={styles.sectionList}>
          {items.map((item) => (
            <div key={item.label} className={styles.sectionRow}>
              <span className={styles.rowLabel}>
                <item.icon size={14} />
                {item.label}
              </span>
              <span className={styles.rowCount}>{item.count}</span>
              <Link href={item.href} className={styles.actionLink}>
                处理
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
