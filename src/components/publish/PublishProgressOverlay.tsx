'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { X, Loader2, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import type { SyncTask, SyncReceiptStatus } from '@/lib/sync/types';
import type { PlatformId } from '@/types';
import * as styles from './PublishProgressOverlay.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

function isTerminalStatus(status: SyncReceiptStatus) {
  return status !== 'pending' && status !== 'syncing';
}

function StatusIcon({ status }: { status: SyncReceiptStatus }) {
  if (status === 'pending' || status === 'syncing') {
    return <Loader2 size={14} className="animate-spin" />;
  }
  if (status === 'published' || status === 'draft-created') {
    return <CheckCircle2 size={14} style={{ color: 'var(--success-text, #247a4b)' }} />;
  }
  return <XCircle size={14} style={{ color: 'var(--error-text, #bf4b4b)' }} />;
}

function statusLabel(status: SyncReceiptStatus): string {
  switch (status) {
    case 'pending': return '等待中';
    case 'syncing': return '发布中…';
    case 'draft-created': return '草稿已创建';
    case 'published': return '已发布';
    case 'failed': return '失败';
    case 'needs-action': return '需要处理';
    default: return status;
  }
}

function statusClass(status: SyncReceiptStatus): string {
  if (status === 'published' || status === 'draft-created') return styles.statusTextSuccess;
  if (status === 'failed' || status === 'needs-action') return styles.statusTextError;
  return styles.statusText;
}

export default function PublishProgressOverlay() {
  const { isProgressOverlayOpen, lastSyncTaskId, closeProgressOverlay } = usePublishStore();
  const [syncTask, setSyncTask] = useState<SyncTask | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isDone = syncTask
    ? syncTask.receipts.every((r) => isTerminalStatus(r.status))
    : false;

  useEffect(() => {
    if (!isProgressOverlayOpen || !lastSyncTaskId) return;

    // 立即拉一次
    async function fetchTask() {
      if (!lastSyncTaskId) return;
      try {
        const res = await fetch(`/api/sync-tasks/${lastSyncTaskId}`, { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json() as { syncTask: SyncTask };
        setSyncTask(data.syncTask);
        // 所有 receipt 都到终态时停止轮询
        if (data.syncTask.receipts.every((r) => isTerminalStatus(r.status))) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      } catch {
        // 网络错误时静默，继续等待下一次轮询
      }
    }

    void fetchTask();
    intervalRef.current = setInterval(() => { void fetchTask(); }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isProgressOverlayOpen, lastSyncTaskId]);

  // 关闭时清理状态
  function handleClose() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSyncTask(null);
    closeProgressOverlay();
  }

  if (!isProgressOverlayOpen || !lastSyncTaskId) return null;

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.headerTitle}>分发进度</span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="关闭"
        >
          <X size={14} />
        </button>
      </div>

      <div className={styles.body}>
        {syncTask ? (
          syncTask.receipts.map((receipt) => (
            <div key={receipt.platform} className={styles.receiptRow}>
              <StatusIcon status={receipt.status} />
              <span className={styles.platformName}>
                {platformLabels[receipt.platform] ?? receipt.platform}
              </span>
              <span className={`${styles.statusText} ${statusClass(receipt.status)}`}>
                {statusLabel(receipt.status)}
              </span>
            </div>
          ))
        ) : (
          // 任务数据尚未加载时的骨架
          <div className={styles.receiptRow}>
            <Loader2 size={14} className="animate-spin" />
            <span className={styles.platformName}>正在初始化…</span>
          </div>
        )}
      </div>

      {isDone && (
        <div className={styles.footer}>
          <Link
            href={`/sync-tasks/${lastSyncTaskId}`}
            className={styles.detailLink}
            onClick={handleClose}
          >
            查看完整详情
            <ArrowUpRight size={13} />
          </Link>
        </div>
      )}
    </div>
  );
}
