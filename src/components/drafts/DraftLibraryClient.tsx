'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  RefreshCcw,
  PenLine,
  ArrowRightCircle,
  Trash2,
  Download,
  Upload,
  Archive,
  LayoutList,
  Columns3,
  ChevronDown,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import type { ContentDraft, DraftSource, DraftStatus } from '@/lib/drafts/types';
import FilterChipGroup from '@/components/ui/FilterChipGroup';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import { deleteDraft, createDraft, updateDraft } from '@/lib/drafts/client';
import {
  exportDraftToMarkdown,
  parseMarkdownToDraft,
  downloadFile,
  readTextFile,
} from '@/lib/drafts/importExport';
import {
  getCachedDraftLibraryData,
  loadDraftLibraryData,
  setCachedDraftLibraryData,
} from '@/lib/navigationDataCache';
import EmptyState from '@/components/feedback/EmptyState';
import * as styles from './drafts.css';

interface DraftsResponse {
  drafts?: ContentDraft[];
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

const STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '全部' },
  ...(['draft', 'ready', 'syncing', 'synced', 'failed'] as const).map((s) => ({
    value: s,
    label: statusLabels[s],
  })),
];

const sourceLabels: Record<DraftSource, string> = {
  manual: '手动创建',
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

type ViewMode = 'pipeline' | 'compact';
const PAGE_SIZE = 20;

interface Props {
  isEditMode: boolean;
  onExitEditMode: () => void;
}

export default function DraftLibraryClient({ isEditMode, onExitEditMode }: Props) {
  const cachedData = getCachedDraftLibraryData();
  const [drafts, setDrafts] = useState<ContentDraft[]>(() => cachedData?.drafts ?? []);
  const [syncTasks, setSyncTasks] = useState<SyncTask[]>(() => cachedData?.syncTasks ?? []);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [statusFilter, setStatusFilter] = useState<DraftStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const mobileFilterSheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditMode) {
      setSelected(new Set());
      setDeleteError('');
    }
  }, [isEditMode]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [statusFilter, searchQuery, tagFilter]);

  useClickOutside([filterPopoverRef, mobileFilterSheetRef], mobileFilterOpen, () =>
    setMobileFilterOpen(false),
  );

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

  function handleExport(draft: ContentDraft) {
    const md = exportDraftToMarkdown(draft);
    const filename = `${draft.title.replace(/[^a-zA-Z0-9一-鿿]/g, '_').slice(0, 40) || 'draft'}.md`;
    downloadFile(filename, md);
  }

  async function handleImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md,.markdown,.txt';
    input.multiple = true;
    input.onchange = async () => {
      const files = Array.from(input.files ?? []);
      if (files.length === 0) return;

      try {
        for (const file of files) {
          const text = await readTextFile(file);
          const parsed = parseMarkdownToDraft(text);
          await createDraft(parsed);
        }
        // 重新加载列表
        const res = await fetch('/api/drafts');
        const data = (await res.json()) as DraftsResponse;
        if (data.drafts) {
          setCachedDraftLibraryData({
            drafts: data.drafts,
            syncTasks,
          });
          setDrafts(data.drafts);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '导入失败');
      }
    };
    input.click();
  }

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
          <Link href="/" className={styles.primaryLink}>
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

      {!isEditMode && (
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="搜索稿件标题或内容..."
              aria-label="搜索稿件"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div ref={filterPopoverRef} className={styles.filterPopoverWrap}>
            <button
              type="button"
              className={styles.importButton}
              onClick={() => setMobileFilterOpen((open) => !open)}
              title="筛选"
              aria-expanded={mobileFilterOpen}
              aria-label="打开筛选面板"
            >
              <SlidersHorizontal size={14} />
              筛选
            </button>
            {mobileFilterOpen && (
              <div className={styles.filterPopover}>
                <p className={styles.filterPopoverTitle}>筛选状态</p>
                <FilterChipGroup
                  options={STATUS_FILTER_OPTIONS}
                  value={statusFilter}
                  onChange={(v) => {
                    setStatusFilter(v);
                    setMobileFilterOpen(false);
                  }}
                  className={styles.filterBar}
                />
              </div>
            )}
          </div>
          <div className={styles.viewToggle}>
            <button
              type="button"
              className={styles.viewToggleButton({ active: viewMode === 'compact' })}
              onClick={() => setViewMode('compact')}
              aria-label="紧凑列表"
              title="紧凑列表"
            >
              <LayoutList size={16} />
            </button>
            <button
              type="button"
              className={styles.viewToggleButton({ active: viewMode === 'pipeline' })}
              onClick={() => setViewMode('pipeline')}
              aria-label="流水线视图（展开详情）"
              title="流水线视图（展开详情）"
            >
              <Columns3 size={16} />
            </button>
          </div>
          <button
            type="button"
            className={styles.importButton}
            onClick={() => void handleImport()}
            title="导入 Markdown 文件"
          >
            <Upload size={14} />
            导入
          </button>
        </div>
      )}

      {/* Mobile filter sheet */}
      {mobileFilterOpen && (
        <div className={styles.mobileFilterOverlay} onClick={() => setMobileFilterOpen(false)}>
          <div
            ref={mobileFilterSheetRef}
            className={styles.mobileFilterSheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.mobileFilterHandle} />
            <p className={styles.mobileFilterTitle}>筛选</p>
            <FilterChipGroup
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => {
                setStatusFilter(v);
                setMobileFilterOpen(false);
              }}
              className={styles.filterBar}
            />
          </div>
        </div>
      )}

      {/* 标签筛选 */}
      {!isEditMode &&
        (() => {
          const allTags = [...new Set(drafts.flatMap((d) => d.tags ?? []))];
          if (allTags.length === 0) return null;
          return (
            <div className={styles.tagContainer}>
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
                setSearchQuery('');
                setStatusFilter('all');
                setTagFilter('');
              }}
            >
              清除筛选
            </button>
          }
        />
      ) : viewMode === 'compact' ? (
        <div className={styles.compactList}>
          {pagedDrafts.map((draft) => {
            const isSelected = selected.has(draft.id);
            return (
              <div
                key={draft.id}
                className={styles.compactRow}
                style={
                  isEditMode && isSelected
                    ? { background: 'var(--accent-soft, rgba(0,0,0,0.04))' }
                    : undefined
                }
                onClick={isEditMode ? () => toggleSelect(draft.id) : undefined}
                role={isEditMode ? 'checkbox' : undefined}
                aria-checked={isEditMode ? isSelected : undefined}
                tabIndex={isEditMode ? 0 : undefined}
                onKeyDown={
                  isEditMode
                    ? (e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleSelect(draft.id);
                        }
                      }
                    : undefined
                }
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
                <Link
                  href={`/?draftId=${draft.id}`}
                  className={styles.compactTitle}
                  onClick={(e) => isEditMode && e.preventDefault()}
                >
                  {draft.title || '无标题'}
                </Link>
                <span className={styles.compactStatus}>{statusLabels[draft.status]}</span>
                <span className={styles.compactTime}>{formatDraftTime(draft.updatedAt)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.pipelineList}>
          {pagedDrafts.map((draft) => {
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
                onKeyDown={
                  isEditMode
                    ? (e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleSelect(draft.id);
                        }
                      }
                    : undefined
                }
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
                    <FileText size={14} />
                  </span>
                  <div className={styles.pipelineStepContent}>
                    <span className={styles.pipelineStepLabel}>{sourceLabels[draft.source]}</span>
                  </div>
                </div>

                <ArrowRightCircle size={14} className={styles.pipelineArrow} />

                <div className={styles.pipelineStep}>
                  <span className={styles.pipelineStepIcon}>
                    <PenLine size={14} />
                  </span>
                  <div className={styles.pipelineStepContent}>
                    <span className={styles.pipelineStepLabel} title={draft.title}>
                      {draft.title || '无标题'}
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
                  <div
                    className={
                      styles.syncStatusStepVariants[
                        syncTask.status in styles.syncStatusStepVariants
                          ? (syncTask.status as keyof typeof styles.syncStatusStepVariants)
                          : 'default'
                      ]
                    }
                  >
                    <span className={styles.pipelineStepIcon}>
                      <FileText size={14} />
                    </span>
                    <div className={styles.pipelineStepContent}>
                      <span
                        className={
                          styles.syncStatusLabelVariants[
                            syncTask.status in styles.syncStatusLabelVariants
                              ? (syncTask.status as keyof typeof styles.syncStatusLabelVariants)
                              : 'default'
                          ]
                        }
                      >
                        {syncStatusLabels[syncTask.status]}
                      </span>
                      <span className={styles.pipelineStepHint}>发布记录已内联显示</span>
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

                {!isEditMode && (
                  <button
                    type="button"
                    className={styles.exportButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(draft);
                    }}
                    title="导出为 Markdown"
                  >
                    <Download size={13} />
                  </button>
                )}
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
