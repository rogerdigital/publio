'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, FileText, RefreshCcw } from 'lucide-react';
import type { ContentDraft, DraftSource, DraftStatus } from '@/lib/drafts/types';
import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import * as styles from './drafts.css';

interface DraftsResponse {
  drafts?: ContentDraft[];
  error?: string;
}

interface SyncTasksResponse {
  syncTasks?: SyncTask[];
  error?: string;
}

const statusLabels: Record<DraftStatus, string> = {
  draft: '草稿',
  ready: '待同步',
  syncing: '同步中',
  synced: '已同步',
  failed: '同步失败',
  archived: '已归档',
};

const sourceLabels: Record<DraftSource, string> = {
  manual: '手动创建',
  'ai-news': 'AI 选题',
  import: '导入',
};

const syncStatusLabels: Record<SyncTaskStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  completed: '已完成',
  failed: '失败',
  partial: '部分完成',
  'needs-action': '需要处理',
};

function formatDraftTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '时间待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

function createExcerpt(content: string) {
  const plain = content.replace(/\s+/g, ' ').trim();
  return plain.length > 96 ? `${plain.slice(0, 96)}...` : plain;
}

export default function DraftLibraryClient() {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadDrafts() {
      try {
        setLoading(true);
        setError('');
        const [draftsResponse, syncTasksResponse] = await Promise.all([
          fetch('/api/drafts', { cache: 'no-store' }),
          fetch('/api/sync-tasks', { cache: 'no-store' }),
        ]);
        const data = (await draftsResponse.json()) as DraftsResponse;
        const syncData = (await syncTasksResponse.json()) as SyncTasksResponse;

        if (!draftsResponse.ok) {
          throw new Error(data.error || '稿件读取失败，请稍后重试。');
        }
        if (!syncTasksResponse.ok) {
          throw new Error(syncData.error || '分发记录读取失败，请稍后重试。');
        }

        if (!cancelled) {
          setDrafts(data.drafts ?? []);
          setSyncTasks(syncData.syncTasks ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '稿件读取失败，请稍后重试。');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadDrafts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={styles.statePanel}>
        <RefreshCcw size={18} className="animate-spin" />
        <p>正在读取稿件库...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.statePanel}>
        <p className={styles.stateTitle}>稿件库暂时不可用</p>
        <p className={styles.stateText}>{error}</p>
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <FileText size={24} />
        </div>
        <p className={styles.stateTitle}>还没有稿件</p>
        <p className={styles.stateText}>
          从写作台新建内容，或从选题台把研究底稿加入稿件库。
        </p>
        <Link href="/" className={styles.primaryLink}>
          新建稿件
          <ArrowRight size={15} />
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.draftList}>
      {drafts.map((draft) => {
        const latestSyncTask = syncTasks.find((task) => task.draftId === draft.id);

        return (
          <article key={draft.id} className={styles.draftCard}>
            <div className={styles.draftMetaRow}>
              <span className={styles.statusBadge}>{statusLabels[draft.status]}</span>
              <span className={styles.sourceBadge}>{sourceLabels[draft.source]}</span>
              <time className={styles.updatedTime} dateTime={draft.updatedAt}>
                {formatDraftTime(draft.updatedAt)}
              </time>
            </div>

            <div>
              <h2 className={styles.draftTitle}>{draft.title}</h2>
              <p className={styles.draftExcerpt}>{createExcerpt(draft.content)}</p>
              {latestSyncTask ? (
                <div className={styles.syncSummary}>
                  <p className={styles.syncTitle}>
                    最近分发：{syncStatusLabels[latestSyncTask.status]}
                  </p>
                  <p className={styles.syncText}>
                    {latestSyncTask.receipts.length} 个平台，更新于 {formatDraftTime(latestSyncTask.updatedAt)}
                  </p>
                  <Link
                    href={`/sync-tasks/${latestSyncTask.id}`}
                    className={styles.syncDetailLink}
                  >
                    查看分发详情
                  </Link>
                </div>
              ) : null}
            </div>

            <Link
              href={`/?draftId=${draft.id}`}
              className={styles.editLink}
              aria-label={`继续编辑 ${draft.title}`}
            >
              继续编辑
              <ArrowRight size={15} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
