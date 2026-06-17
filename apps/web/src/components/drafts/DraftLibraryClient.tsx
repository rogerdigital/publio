import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, RefreshCcw, Trash2, Download, Archive, ChevronDown } from 'lucide-react';
import type { ContentDraft, DraftStatus } from '@/lib/drafts/types';
import type { SyncTask } from '@/lib/sync/types';
import { deleteDraft, updateDraft } from '@/lib/drafts/client';
import { exportDraftToMarkdown, downloadFile } from '@/lib/drafts/importExport';
import { statusLabels, sourceLabels, syncStatusLabels } from '@/lib/drafts/labels';
import {
  getCachedDraftLibraryData,
  loadDraftLibraryData,
  setCachedDraftLibraryData,
} from '@/lib/navigationDataCache';
import EmptyState from '@/components/feedback/EmptyState';
import * as styles from './drafts.css';

function formatDraftTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '时间待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

// 从 Markdown 正文提取纯文本摘要，去掉标记符号
function extractExcerpt(content: string) {
  return content
    .replace(/```[\s\S]*?```/g, ' ') // 代码块
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
    .replace(/^#{1,6}\s+/gm, '') // 标题符号
    .replace(/^\s*>+\s?/gm, '') // 引用
    .replace(/^\s*[-*+]\s+/gm, '') // 无序列表
    .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
    .replace(/[*_~`]/g, '') // 强调/行内代码符号
    .replace(/\s+/g, ' ')
    .trim();
}

const PAGE_SIZE = 20;

interface Props {
  isEditMode: boolean;
  onExitEditMode: () => void;
  searchQuery: string;
  statusFilter: DraftStatus | 'all';
  onClearFilters: () => void;
}

export default function DraftLibraryClient({
  isEditMode,
  onExitEditMode,
  searchQuery,
  statusFilter,
  onClearFilters,
}: Props) {
  const cachedData = getCachedDraftLibraryData();
  const [drafts, setDrafts] = useState<ContentDraft[]>(() => cachedData?.drafts ?? []);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>(() => cachedData?.syncTasks ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (!isEditMode) {
      setSelected(new Set());
      setDeleteError('');
    }
  }, [isEditMode]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [statusFilter, searchQuery, tagFilter]);

  useEffect(() => {
    let cancelled = false;

    async function loadDrafts() {
      try {
        if (!getCachedDraftLibraryData()) setLoading(true);
        setError('');
        const data = await loadDraftLibraryData();

        if (!cancelled) {
          setDrafts(data.drafts);
          setSyncTasks(data.syncTasks);
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
      setDrafts((prev) => {
        const nextDrafts = prev.filter((d) => !selected.has(d.id));
        setCachedDraftLibraryData({ drafts: nextDrafts, syncTasks });
        return nextDrafts;
      });
      onExitEditMode();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '删除失败，请稍后重试。');
    } finally {
      setDeleting(false);
    }
  }

  function handleExportSelected() {
    const selectedDrafts = drafts.filter((d) => selected.has(d.id));
    for (const draft of selectedDrafts) {
      const md = exportDraftToMarkdown(draft);
      const filename = `${draft.title.replace(/[^a-zA-Z0-9一-鿿]/g, '_').slice(0, 40) || 'draft'}.md`;
      downloadFile(filename, md);
    }
  }

  async function handleArchiveSelected() {
    if (selected.size === 0 || deleting) return;
    setDeleting(true);
    setDeleteError('');
    try {
      await Promise.all(Array.from(selected).map((id) => updateDraft(id, { status: 'archived' })));
      setDrafts((prev) => {
        const nextDrafts = prev.map((d) =>
          selected.has(d.id) ? { ...d, status: 'archived' as const } : d,
        );
        setCachedDraftLibraryData({ drafts: nextDrafts, syncTasks });
        return nextDrafts;
      });
      onExitEditMode();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '归档失败，请稍后重试。');
    } finally {
      setDeleting(false);
    }
  }

  const filteredDrafts = drafts
    .filter((d) => statusFilter === 'all' || d.status === statusFilter)
    .filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q);
    })
    .filter((d) => !tagFilter || (d.tags ?? []).includes(tagFilter));

  const pagedDrafts = filteredDrafts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDrafts.length;

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
      <EmptyState
        icon={<FileText size={24} />}
        title="还没有稿件"
        description="从写作台新建内容，保存后会出现在这里。"
        action={
          <Link to="/" className={styles.primaryLink}>
            去写作台
          </Link>
        }
      />
    );
  }

  return (
    <div className={styles.pageContent}>
      {isEditMode && (
        <div className={styles.editModeBar}>
          <div className={styles.editModeBarLeft}>
            <span className={styles.editModeCount}>已选 {selected.size} 篇</span>
            {deleteError ? <span className={styles.deleteErrorText}>{deleteError}</span> : null}
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
              className={styles.batchActionButton}
              onClick={handleExportSelected}
              disabled={selected.size === 0}
              title="导出选中稿件"
            >
              <Download size={13} />
              导出
            </button>
            <button
              type="button"
              className={styles.batchActionButton}
              onClick={() => void handleArchiveSelected()}
              disabled={selected.size === 0 || deleting}
              title="归档选中稿件"
            >
              <Archive size={13} />
              归档
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

      {/* 标签筛选 */}
      {!isEditMode &&
        (() => {
          const allTags = [...new Set(drafts.flatMap((d) => d.tags ?? []))];
          if (allTags.length === 0) return null;
          return (
            <div className={styles.tagBar}>
              {tagFilter && (
                <button
                  type="button"
                  className={styles.tagChip({ active: false, clickable: true })}
                  onClick={() => setTagFilter('')}
                >
                  全部标签
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={styles.tagChip({ active: tagFilter === tag, clickable: true })}
                  onClick={() => setTagFilter(tagFilter === tag ? '' : tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          );
        })()}

      {filteredDrafts.length === 0 && (searchQuery || statusFilter !== 'all' || tagFilter) ? (
        <EmptyState
          icon={<FileText size={24} />}
          title="没有找到匹配的稿件"
          description={
            searchQuery ? `没有包含"${searchQuery}"的稿件。` : '当前筛选条件下没有稿件。'
          }
          action={
            <button
              type="button"
              className={styles.primaryLink}
              onClick={() => {
                onClearFilters();
                setTagFilter('');
              }}
            >
              清除筛选
            </button>
          }
        />
      ) : (
        <div className={styles.compactList}>
          {pagedDrafts.map((draft) => {
            const syncTask = syncTasks.find((t) => t.draftId === draft.id);
            const isSelected = selected.has(draft.id);
            const excerpt = extractExcerpt(draft.content);

            const body = (
              <div className={styles.compactBody}>
                <span className={styles.compactTitle}>{draft.title || '无标题'}</span>
                {excerpt ? (
                  <p className={styles.compactExcerpt}>{excerpt}</p>
                ) : (
                  <p className={styles.compactExcerptEmpty}>暂无正文内容</p>
                )}
                <div className={styles.compactMetaRow}>
                  <span className={styles.compactMeta}>{sourceLabels[draft.source]}</span>
                  <span className={styles.compactStatus}>{statusLabels[draft.status]}</span>
                  <span className={styles.compactSyncStatus}>
                    {syncTask ? syncStatusLabels[syncTask.status] : '尚未分发'}
                  </span>
                  <span className={styles.compactTime}>{formatDraftTime(draft.updatedAt)}</span>
                </div>
              </div>
            );

            if (!isEditMode) {
              return (
                <Link key={draft.id} to={`/?draftId=${draft.id}`} className={styles.compactRow}>
                  {body}
                </Link>
              );
            }

            return (
              <div
                key={draft.id}
                className={styles.compactRow}
                style={
                  isSelected ? { background: 'var(--accent-soft, rgba(0,0,0,0.04))' } : undefined
                }
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
                  className={styles.draftCardCheckbox}
                  checked={isSelected}
                  onChange={() => toggleSelect(draft.id)}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`选择稿件 ${draft.title}`}
                />
                {body}
              </div>
            );
          })}
        </div>
      )}

      {hasMore && (
        <div className={styles.loadMoreWrap}>
          <div>
            <button
              type="button"
              className={styles.loadMoreButton}
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
            >
              <ChevronDown size={14} />
              加载更多
            </button>
            <p className={styles.loadMoreCount}>
              已显示 {pagedDrafts.length} / {filteredDrafts.length} 篇
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
