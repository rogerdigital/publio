'use client';

import { useEffect, useState } from 'react';
import { Eye, SquarePen } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import {
  NEWS_DRAFT_STORAGE_KEY,
  type NewsDraftPayload,
} from '@/lib/newsDraft';
import * as styles from './page.css';

export default function HomePage() {
  const { setTitle, setContent, reset, overallStatus } = usePublishStore();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    const rawDraft = window.localStorage.getItem(NEWS_DRAFT_STORAGE_KEY);
    if (!rawDraft) return;

    try {
      const draft = JSON.parse(rawDraft) as NewsDraftPayload;
      setTitle(draft.title || '');
      setContent(draft.content || '');
      reset();
      window.localStorage.removeItem(NEWS_DRAFT_STORAGE_KEY);
    } catch {
      window.localStorage.removeItem(NEWS_DRAFT_STORAGE_KEY);
    }
  }, [reset, setContent, setTitle]);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Compose & publish"
        title="写作台"
        description="在一个界面里完成写作、排版预览与多平台分发。"
        action={
          <div className={styles.tabSwitcher}>
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={styles.tabButton({ active: activeTab === 'edit' })}
            >
              <SquarePen size={15} />
              写作
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={styles.tabButton({ active: activeTab === 'preview' })}
            >
              <Eye size={15} />
              预览
            </button>
          </div>
        }
      />

      <div className={styles.editorSection}>
        <div className={styles.editorCard}>
          <MarkdownEditor activeTab={activeTab} />
        </div>

        <div className={styles.publishBar}>
          <PlatformSelector />
          <div className={styles.publishRight}>
            {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
              <button
                onClick={reset}
                className={styles.resetLink}
              >
                清除结果
              </button>
            )}
            <PublishButton />
          </div>
        </div>

        {overallStatus !== 'idle' && (
          <PublishStatusPanel />
        )}
      </div>
    </div>
  );
}
