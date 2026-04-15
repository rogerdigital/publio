'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Files, SquarePen, Eraser } from 'lucide-react';
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
import { useAutoSave } from '@/hooks/useAutoSave';
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
    currentDraftId,
    setCurrentDraftId,
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

  const handleDraftCreated = useCallback((id: string) => {
    setCurrentDraftId(id);
    router.replace(`/?draftId=${id}`);
  }, [setCurrentDraftId, router]);

  const { saveStatus } = useAutoSave({
    title,
    content,
    draftId: currentDraftId,
    onDraftCreated: handleDraftCreated,
  });

  const handleNewDraft = useCallback(() => {
    setTitle('');
    setContent('');
    setCurrentDraftId(null);
    reset();
    router.replace('/');
  }, [reset, router, setContent, setTitle, setCurrentDraftId]);

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
        setCurrentDraftId(selectedDraftId);
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
  }, [reset, searchParams, setContent, setTitle, setCurrentDraftId]);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Compose & publish"
        title="写作台"
        description="在一个界面里完成写作、排版预览与多平台分发。"
        action={
          <div className={styles.headerActions}>
            {saveStatus === 'saving' && (
              <span className={styles.saveStatusHint}>保存中…</span>
            )}
            {saveStatus === 'saved' && (
              <span className={styles.saveStatusHint}>已自动保存</span>
            )}
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
              onClick={handleNewDraft}
              className={styles.newDraftButton}
              title="清空写作台"
            >
              <Eraser size={15} />
              清空
            </button>
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

        <div className={styles.mainContentArea}>
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
          </div>

          <div className={styles.rightPanel}>
            <PlatformSelector />

            <PlatformPreviewPanel
              adaptations={platformDrafts}
              selectedPlatforms={selectedPlatforms}
            />

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

            {overallStatus !== 'idle' && (
              <PublishStatusPanel />
            )}
          </div>
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
