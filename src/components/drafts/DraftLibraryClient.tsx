'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, RefreshCcw, Newspaper, PenLine, ArrowRightCircle, Trash2 } from 'lucide-react';
import type { ContentDraft, DraftSource, DraftStatus } from '@/lib/drafts/types';
import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import { deleteDraft } from '@/lib/drafts/client';
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

interface Props {
  isEditMode: boolean;
  onExitEditMode: () => void;
}

export default function DraftLibraryClient({ isEditMode, onExitEditMode }: Props) {
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (!isEditMode) {
      setSelected(new Set());
      setDeleteError('');
    }
  }, [isEditMode]);

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

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDeleteSelected() {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await Promise.all(Array.from(selected).map((id) => deleteDraft(id)));
      setDrafts((prev) => prev.filter((d) => !selected.has(d.id)));
      onExitEditMode();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '删除失败，请稍后重试。');
    } finally {
      setDeleting(false);
    }
  }

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
          去写作台
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.pageContent}>
      {isEditMode && (
        <div className={styles.editModeBar}>
          <div className={styles.editModeBarLeft}>
            <span className={styles.editModeCount}>已选 {selected.size} 篇</span>
            {deleteError ? (
              <span className={styles.deleteErrorText}>{deleteError}</span>
            ) : null}
          </div>
          <div className={styles.editModeBarRight}>
            <button
              type="button"
              className={styles.editModeCancelButton}
              onClick={onExitEditMode}
              disabled={deleting}
            >
              取消
            </button>
            <button
              type="button"
              className={styles.editModeDeleteButton}
              onClick={() => void handleDeleteSelected()}
              disabled={selected.size === 0 || deleting}
            >
              <Trash2 size={13} />
              {deleting ? '删除中...' : `删除${selected.size > 0 ? `(${selected.size})` : ''}`}
            </button>
          </div>
        </div>
      )}

      <div className={styles.pipelineList}>
        {drafts.map((draft) => {
          const syncTask = syncTasks.find((t) => t.draftId === draft.id);
          const isSelected = selected.has(draft.id);

          return (
            <div
              key={draft.id}
              className={
                isEditMode
                  ? styles.pipelineRowSelectable({ selected: isSelected })
                  : styles.pipelineCard
              }
              onClick={isEditMode ? () => toggleSelect(draft.id) : undefined}
              role={isEditMode ? 'checkbox' : undefined}
              aria-checked={isEditMode ? isSelected : undefined}
              tabIndex={isEditMode ? 0 : undefined}
              onKeyDown={isEditMode ? (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleSelect(draft.id);
                }
              } : undefined}
            >
              {isEditMode && (
                <input
                  type="checkbox"
                  className={styles.draftCardCheckbox}
                  checked={isSelected}
                  onChange={() => toggleSelect(draft.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`选择稿件 ${draft.title}`}
                />
              )}

              <div className={styles.pipelineStep}>
                <span className={styles.pipelineStepIcon}>
                  <Newspaper size={14} />
                </span>
                <div className={styles.pipelineStepContent}>
                  <span className={styles.pipelineStepLabel}>
                    {sourceLabels[draft.source]}
                  </span>
                  {draft.source === 'ai-news' && (
                    <Link
                      href="/ai-news"
                      className={styles.pipelineStepLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      重新选题
                    </Link>
                  )}
                </div>
              </div>

              <ArrowRightCircle size={14} className={styles.pipelineArrow} />

              <div className={styles.pipelineStep}>
                <span className={styles.pipelineStepIcon}>
                  <PenLine size={14} />
                </span>
                <div className={styles.pipelineStepContent}>
                  <span className={styles.pipelineStepLabel} title={draft.title}>
                    {draft.title.length > 24 ? `${draft.title.slice(0, 24)}…` : draft.title}
                  </span>
                  <Link
                    href={`/?draftId=${draft.id}`}
                    className={styles.pipelineStepLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {statusLabels[draft.status]}，去编辑
                  </Link>
                </div>
              </div>

              <ArrowRightCircle size={14} className={styles.pipelineArrow} />

              {syncTask ? (
                <div className={styles.syncStatusStepVariants[syncTask.status in styles.syncStatusStepVariants ? syncTask.status as keyof typeof styles.syncStatusStepVariants : 'default']}>
                  <span className={styles.pipelineStepIcon}>
                    <FileText size={14} />
                  </span>
                  <div className={styles.pipelineStepContent}>
                    <span className={styles.syncStatusLabelVariants[syncTask.status in styles.syncStatusLabelVariants ? syncTask.status as keyof typeof styles.syncStatusLabelVariants : 'default']}>
                      {syncStatusLabels[syncTask.status]}
                    </span>
                    <Link
                      href={`/sync-tasks/${syncTask.id}`}
                      className={styles.pipelineStepLink}
                      onClick={(e) => e.stopPropagation()}
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              ) : (
                <div className={styles.syncStatusStepVariants.default}>
                  <span className={styles.pipelineStepIcon}>
                    <FileText size={14} />
                  </span>
                  <div className={styles.pipelineStepContent}>
                    <span className={styles.syncStatusLabelVariants.default}>尚未分发</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// suppress unused import warning – formatDraftTime kept for future use
void formatDraftTime;
