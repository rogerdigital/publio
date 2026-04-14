'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Plus } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import DraftLibraryClient from '@/components/drafts/DraftLibraryClient';
import * as styles from './drafts.page.css';

export default function DraftsPageClient() {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Draft library"
        title="稿件库"
        description="管理所有草稿，追踪从选题到分发的完整链路。"
        action={
          <div className={styles.headerActions}>
            {isEditMode ? (
              <button
                type="button"
                className={styles.editCancelButton}
                onClick={() => setIsEditMode(false)}
              >
                取消编辑
              </button>
            ) : (
              <>
                <Link href="/" className={styles.newDraftLink}>
                  <Plus size={14} />
                  新建稿件
                </Link>
                <button
                  type="button"
                  className={styles.editToggleButton}
                  onClick={() => setIsEditMode(true)}
                >
                  <Pencil size={14} />
                  编辑
                </button>
              </>
            )}
          </div>
        }
      />
      <DraftLibraryClient
        isEditMode={isEditMode}
        onExitEditMode={() => setIsEditMode(false)}
      />
    </div>
  );
}
