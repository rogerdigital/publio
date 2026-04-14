'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Plus, History, RefreshCcw, Pencil, Trash2 } from 'lucide-react';
import type { ContentDraft, DraftStatus } from '@/lib/drafts/types';
import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import { deleteDraft } from '@/lib/drafts/client';
import * as styles from './DraftPanel.css';

const statusLabels: Record<DraftStatus, string> = {
  draft: '草稿',
  ready: '待同步',
  syncing: '同步中',
  synced: '已同步',
  failed: '失败',
  archived: '已归档',
};

const syncStatusSuffix: Record<SyncTaskStatus, string> = {
  pending: '',
  syncing: '',
  completed: ' · 已发布',
  failed: ' · 发布失败',
  partial: ' · 部分发布',
  'needs-action': ' · 需处理',
};

interface DraftsResponse {
  drafts?: ContentDraft[];
}

interface SyncTasksResponse {
  syncTasks?: SyncTask[];
}

interface Props {
  onNewDraft: () => void;
}

export default function DraftPanel({ onNewDraft }: Props) {
  const searchParams = useSearchParams();
  const currentDraftId = searchParams.get('draftId');
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [dr, sr] = await Promise.all([
          fetch('/api/drafts', { cache: 'no-store' }),
          fetch('/api/sync-tasks', { cache: 'no-store' }),
        ]);
        const dData = (await dr.json()) as DraftsResponse;
        const sData = (await sr.json()) as SyncTasksResponse;
        if (!cancelled) {
          setDrafts(dData.drafts ?? []);
          setSyncTasks(sData.syncTasks ?? []);
        }
      } catch {
        // silently ignore — panel is supplementary
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
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

  function exitEditMode() {
    setIsEditMode(false);
    setSelected(new Set());
  }

  async function handleDeleteSelected() {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    try {
      await Promise.all(Array.from(selected).map((id) => deleteDraft(id)));
      setDrafts((prev) => prev.filter((d) => !selected.has(d.id)));
      exitEditMode();
    } catch {
      // silently ignore — non-critical panel
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>草稿</span>
        <div className={styles.headerActions}>
          {!isEditMode ? (
            <>
              <Link href="/sync-tasks" className={styles.historyLink} title="分发记录">
                <History size={13} />
              </Link>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className={styles.newBtn}
                title="编辑草稿"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={onNewDraft}
                className={styles.newBtn}
                title="新建稿件"
              >
                <Plus size={14} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={styles.editActionBtn({ variant: 'cancel' })}
                onClick={exitEditMode}
                disabled={deleting}
              >
                取消
              </button>
              <button
                type="button"
                className={styles.editActionBtn({ variant: 'delete' })}
                onClick={() => void handleDeleteSelected()}
                disabled={selected.size === 0 || deleting}
              >
                <Trash2 size={11} />
                {deleting ? '...' : `删除${selected.size > 0 ? `(${selected.size})` : ''}`}
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.center}>
            <RefreshCcw size={13} className="animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <p className={styles.empty}>暂无草稿</p>
        ) : (
          drafts.map((draft) => {
            const syncTask = syncTasks.find((t) => t.draftId === draft.id);
            const isActive = draft.id === currentDraftId;
            const suffix = syncTask ? syncStatusSuffix[syncTask.status] : '';
            const isSelected = selected.has(draft.id);

            if (isEditMode) {
              return (
                <div
                  key={draft.id}
                  className={styles.itemSelectable({ selected: isSelected })}
                  onClick={() => toggleSelect(draft.id)}
                  role="checkbox"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      toggleSelect(draft.id);
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    className={styles.itemCheckbox}
                    checked={isSelected}
                    onChange={() => toggleSelect(draft.id)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`选择 ${draft.title || '无标题'}`}
                  />
                  <div className={styles.itemBody}>
                    <span className={styles.itemTitle}>
                      {draft.title || '无标题'}
                    </span>
                    <span className={styles.itemMeta}>
                      {statusLabels[draft.status]}{suffix}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={draft.id}
                href={`/?draftId=${draft.id}`}
                className={styles.item({ active: isActive })}
              >
                <span className={styles.itemTitle}>
                  {draft.title || '无标题'}
                </span>
                <span className={styles.itemMeta}>
                  {statusLabels[draft.status]}{suffix}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
