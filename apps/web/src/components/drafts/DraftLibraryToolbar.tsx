import { useRef, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import FilterChipGroup from '@/components/ui/FilterChipGroup';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { DraftStatus } from '@/lib/drafts/types';
import { STATUS_FILTER_OPTIONS, statusLabels } from '@/lib/drafts/labels';
import * as styles from './drafts.css';

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: DraftStatus | 'all';
  onStatusChange: (value: DraftStatus | 'all') => void;
}

export default function DraftLibraryToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: Props) {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const mobileFilterSheetRef = useRef<HTMLDivElement>(null);

  useClickOutside([filterPopoverRef, mobileFilterSheetRef], filterOpen, () => setFilterOpen(false));

  return (
    <div className={styles.headerToolbar}>
      <div className={styles.searchWrap}>
        <Search size={15} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="搜索稿件标题或内容..."
          aria-label="搜索稿件"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div ref={filterPopoverRef} className={styles.filterPopoverWrap}>
        <button
          type="button"
          className={styles.filterButton({ active: statusFilter !== 'all' })}
          onClick={() => setFilterOpen((open) => !open)}
          title="筛选"
          aria-expanded={filterOpen}
          aria-label="打开筛选面板"
        >
          <SlidersHorizontal size={14} />
          {statusFilter === 'all' ? '筛选' : statusLabels[statusFilter]}
          {statusFilter !== 'all' && (
            <span
              className={styles.filterClear}
              role="button"
              tabIndex={0}
              aria-label="清除筛选"
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('all');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onStatusChange('all');
                }
              }}
            >
              <X size={12} />
            </span>
          )}
        </button>
        {filterOpen && (
          <div className={styles.filterPopover}>
            <p className={styles.filterPopoverTitle}>筛选状态</p>
            <FilterChipGroup
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(v) => {
                onStatusChange(v);
                setFilterOpen(false);
              }}
              className={styles.filterBar}
            />
          </div>
        )}
      </div>

      {/* Mobile filter sheet */}
      {filterOpen && (
        <div className={styles.mobileFilterOverlay} onClick={() => setFilterOpen(false)}>
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
                onStatusChange(v);
                setFilterOpen(false);
              }}
              className={styles.filterBar}
            />
          </div>
        </div>
      )}
    </div>
  );
}
