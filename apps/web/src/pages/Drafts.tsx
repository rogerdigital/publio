import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ListChecks, Plus } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import DraftLibraryClient from '@/components/drafts/DraftLibraryClient';
import DraftLibraryToolbar from '@/components/drafts/DraftLibraryToolbar';
import { filterButton } from '@/components/drafts/drafts.css';
import type { DraftStatus } from '@/lib/drafts/types';
import * as styles from './drafts.page.css';

export default function DraftsPageClient() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DraftStatus | 'all'>('all');

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        title="稿件库"
        description="管理草稿，查看发布进展。"
        action={
          <div className={styles.headerActions}>
            {isEditMode ? (
              <button
                type="button"
                className={styles.editCancelButton}
                onClick={() => setIsEditMode(false)}
              >
                取消管理
              </button>
            ) : (
              <>
                <DraftLibraryToolbar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                />
                <button
                  type="button"
                  className={filterButton({ active: false })}
                  onClick={() => setIsEditMode(true)}
                >
                  <ListChecks size={14} />
                  管理
                </button>
                <Link to="/" className={styles.newDraftLink}>
                  <Plus size={14} />
                  新建稿件
                </Link>
              </>
            )}
          </div>
        }
      />
      <DraftLibraryClient
        isEditMode={isEditMode}
        onExitEditMode={() => setIsEditMode(false)}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        onClearFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
        }}
      />
    </div>
  );
}
