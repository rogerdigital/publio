'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Files, SquarePen } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import MarkdownEditor from '@/components/editor/MarkdownEditor';
import RecentDraftBar from '@/components/editor/RecentDraftBar';
import DraftPanel from '@/components/editor/DraftPanel';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import PlatformPreviewPanel from '@/components/publish/PlatformPreviewPanel';
import {
  NEWS_DRAFT_STORAGE_KEY,
  type NewsDraftPayload,
} from '@/lib/newsDraft';
import { fetchDraftById } from '@/lib/drafts/client';
import type { PlatformId } from '@/types';
import * as styles from './page.css';

function HomePageContent() {
  const {
    title,
    content,
    platforms,
    platformDrafts,
    syncPlatformDrafts,
    setTitle,
    setContent,
    reset,
    overallStatus,
  } = usePublishStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [draftLoadError, setDraftLoadError] = useState('');
  const selectedPlatforms = useMemo(
    () => Object.entries(platforms)
      .filter(([, selected]) => selected)
      .map(([platform]) => platform as PlatformId),
    [platforms],
  );

  const handleNewDraft = useCallback(() => {
    setTitle('');
    setContent('');
    reset();
    router.push('/');
  }, [reset, router, setContent, setTitle]);

  useEffect(() => {
    syncPlatformDrafts();
  }, [content, syncPlatformDrafts, title]);

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

  useEffect(() => {
    const draftId = searchParams.get('draftId');
    if (!draftId) return;

    const selectedDraftId = draftId;
    let cancelled = false;
    setDraftLoadError('');

    async function loadDraft() {
      try {
        const draft = await fetchDraftById(selectedDraftId);
        if (cancelled) return;
        setTitle(draft.title);
        setContent(draft.content);
        reset();
      } catch (error) {
        if (!cancelled) {
          setDraftLoadError(error instanceof Error ? error.message : '稿件读取失败，请稍后重试。');
        }
      }
    }

    void loadDraft();
    return () => {
      cancelled = true;
    };
  }, [reset, searchParams, setContent, setTitle]);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Compose & publish"
        title="写作台"
        description="在一个界面里完成写作、排版预览与多平台分发。"
        action={
          <div className={styles.headerActions}>
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
            <button
              type="button"
              onClick={() => setIsPanelOpen((v) => !v)}
              className={styles.panelToggle({ active: isPanelOpen })}
              title={isPanelOpen ? '收起草稿' : '展开草稿'}
            >
              <Files size={14} />
              草稿
            </button>
          </div>
        }
      />

      <div className={styles.editorLayout}>
        <div
          className={styles.panelOuter}
          style={{ width: isPanelOpen ? '216px' : 0 }}
        >
          <DraftPanel onNewDraft={handleNewDraft} />
        </div>

        <div className={styles.editorSection}>
          {draftLoadError ? (
            <div className={styles.draftLoadError} role="status">
              {draftLoadError}
            </div>
          ) : null}

          <div className={styles.mobileOnly}>
            <RecentDraftBar />
          </div>

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

          <PlatformPreviewPanel
            adaptations={platformDrafts}
            selectedPlatforms={selectedPlatforms}
          />

          {overallStatus !== 'idle' && (
            <PublishStatusPanel />
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  );
}
