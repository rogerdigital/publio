'use client';

import { Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Files, SquarePen, Eraser, History, Send } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { useAgentStore } from '@/stores/agentStore';
import AppShellHeader from '@/components/layout/AppShellHeader';

const MarkdownEditor = dynamic(() => import('@/components/editor/MarkdownEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ height: 400, borderRadius: 8, background: 'var(--color-bg-elevated, #eee)' }} />
  ),
});
import RecentDraftBar from '@/components/editor/RecentDraftBar';
import DraftPanel from '@/components/editor/DraftPanel';
import PlatformSelector from '@/components/publish/PlatformSelector';
import PublishButton from '@/components/publish/PublishButton';
import PublishStatusPanel from '@/components/publish/PublishStatusPanel';
import PlatformPreviewPanel from '@/components/publish/PlatformPreviewPanel';
import PlatformVariantPanel from '@/components/publish/PlatformVariantPanel';
import PublishProgressOverlay from '@/components/publish/PublishProgressOverlay';
import PublishTimingSuggestion from '@/components/publish/PublishTimingSuggestion';
import SchedulePicker from '@/components/publish/SchedulePicker';
import EditorialContextCard from '@/components/editor/EditorialContextCard';
import WritingBriefCard from '@/components/editor/WritingBriefCard';
import VersionHistory from '@/components/editor/VersionHistory';
import TemplatePicker from '@/components/editor/TemplatePicker';
import MediaLibrary from '@/components/editor/MediaLibrary';
import AgentPanel from '@/components/agent/AgentPanel';
import TodayWorkbench from '@/components/workbench/TodayWorkbench';
import * as publishStyles from '@/components/publish/publish.css';
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
    currentBriefId,
    setCurrentBriefId,
    setCurrentTopicId,
    activeTab,
    setActiveTab,
  } = usePublishStore();
  const agentStatus = useAgentStore((s) => s.status);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [draftLoadError, setDraftLoadError] = useState('');
  const [clearConfirming, setClearConfirming] = useState(false);
  const [mobilePublishOpen, setMobilePublishOpen] = useState(false);
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [imageBedLabel, setImageBedLabel] = useState<string | undefined>(undefined);

  // 检查 Agent 是否已配置
  useEffect(() => {
    fetch('/api/agent/status')
      .then((r) => r.json())
      .then((data) => setAgentEnabled(data.available === true))
      .catch(() => setAgentEnabled(false));
  }, []);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (
          data.GITHUB_IMAGE_ENABLED === 'true' &&
          data.GITHUB_IMAGE_OWNER &&
          data.GITHUB_IMAGE_REPO
        ) {
          setImageBedLabel('GitHub');
        }
      })
      .catch(() => {});
  }, []);
  const selectedPlatforms = useMemo(
    () =>
      Object.entries(platforms)
        .filter(([, selected]) => selected)
        .map(([platform]) => platform as PlatformId),
    [platforms],
  );

  const handleDraftCreated = useCallback(
    (id: string) => {
      setCurrentDraftId(id);
      router.replace(`/?draftId=${id}`);
    },
    [setCurrentDraftId, router],
  );

  const { saveStatus, triggerSave } = useAutoSave({
    title,
    content,
    draftId: currentDraftId,
    onDraftCreated: handleDraftCreated,
  });

  const handleVersionRestore = useCallback(
    (version: { title: string; content: string }) => {
      setTitle(version.title);
      setContent(version.content);
    },
    [setTitle, setContent],
  );

  const handleNewDraft = useCallback(() => {
    setTitle('');
    setContent('');
    setCurrentDraftId(null);
    setCurrentBriefId(null);
    setCurrentTopicId(null);
    reset();
    router.replace('/');
  }, [
    reset,
    router,
    setContent,
    setTitle,
    setCurrentDraftId,
    setCurrentBriefId,
    setCurrentTopicId,
  ]);

  const handleClearClick = useCallback(() => {
    setClearConfirming(true);
  }, []);

  const handleClearConfirm = useCallback(() => {
    setClearConfirming(false);
    handleNewDraft();
  }, [handleNewDraft]);

  // Defer platform draft sync to avoid blocking typing
  const deferredTitle = useDeferredValue(title);
  const deferredContent = useDeferredValue(content);

  useEffect(() => {
    syncPlatformDrafts();
  }, [deferredContent, syncPlatformDrafts, deferredTitle]);

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
        setCurrentBriefId(draft.briefId ?? null);
        setCurrentTopicId(draft.topicId ?? null);
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
  }, [
    reset,
    searchParams,
    setContent,
    setTitle,
    setCurrentDraftId,
    setCurrentBriefId,
    setCurrentTopicId,
  ]);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        kicker="Compose & publish"
        title="写作台"
        description="在一个界面里完成写作、排版预览与多平台分发。"
        action={
          <div className={styles.headerActions}>
            {saveStatus === 'saving' && <span className={styles.saveStatusHint}>保存中…</span>}
            {saveStatus === 'saved' && <span className={styles.saveStatusHint}>已自动保存</span>}
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
            <TemplatePicker
              currentTitle={title}
              currentContent={content}
              onSelect={(template) => {
                setTitle(template.title);
                setContent(template.content);
              }}
            />
            <MediaLibrary
              imageBedLabel={imageBedLabel}
              onSelect={(url, filename) => {
                const insertion = `\n![${filename}](${url})\n`;
                setContent(content + insertion);
              }}
            />
            <button
              type="button"
              onClick={handleClearClick}
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

      <TodayWorkbench />

      <div className={styles.editorLayout}>
        <div className={styles.panelOuter} style={{ width: isPanelOpen ? '216px' : 0 }}>
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
              <MarkdownEditor
                activeTab={activeTab}
                onSave={triggerSave}
                agentEnabled={agentEnabled}
              />
            </div>
          </div>

          {agentStatus !== 'idle' && <AgentPanel />}

          <div className={styles.rightPanel}>
            <EditorialContextCard />

            {currentBriefId && <WritingBriefCard briefId={currentBriefId} />}

            {currentDraftId && (
              <div className={publishStyles.rightPanelSection}>
                <button
                  type="button"
                  className={publishStyles.collapseToggle}
                  onClick={() => setShowVersionHistory((v) => !v)}
                >
                  <span className={publishStyles.rightPanelSectionTitle}>
                    <History size={12} style={{ marginRight: 4 }} />
                    版本历史
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted, #999)' }}>
                    {showVersionHistory ? '收起' : '展开'}
                  </span>
                </button>
                {showVersionHistory && (
                  <VersionHistory draftId={currentDraftId} onRestore={handleVersionRestore} />
                )}
              </div>
            )}

            <div className={publishStyles.rightPanelSection}>
              <span className={publishStyles.rightPanelSectionTitle}>发布到</span>
              <PlatformSelector />
            </div>

            <div className={publishStyles.rightPanelSection}>
              <SchedulePicker />
            </div>

            <PublishTimingSuggestion />

            <PlatformPreviewPanel
              adaptations={platformDrafts}
              selectedPlatforms={selectedPlatforms}
              agentEnabled={agentEnabled}
            />

            {currentDraftId && (
              <div className={publishStyles.rightPanelSection}>
                <span className={publishStyles.rightPanelSectionTitle}>渠道版本</span>
                <PlatformVariantPanel
                  selectedPlatforms={selectedPlatforms}
                  agentEnabled={agentEnabled}
                />
              </div>
            )}

            <div className={publishStyles.rightPanelSection}>
              <div className={styles.publishRight}>
                {overallStatus !== 'idle' && overallStatus !== 'publishing' && (
                  <button onClick={reset} className={styles.resetLink}>
                    清除结果
                  </button>
                )}
                <PublishButton />
              </div>

              {overallStatus !== 'idle' && <PublishStatusPanel />}
            </div>
          </div>
        </div>
      </div>
      <PublishProgressOverlay />

      {/* Mobile publish FAB */}
      <button
        type="button"
        className={styles.mobilePublishFab}
        onClick={() => setMobilePublishOpen(true)}
      >
        <Send size={18} />
        发布
      </button>

      {/* Mobile publish sheet */}
      {mobilePublishOpen && (
        <div className={styles.mobileSheetOverlay} onClick={() => setMobilePublishOpen(false)}>
          <div className={styles.mobileSheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.mobileSheetHandle} />
            <div className={styles.mobileSheetTitle}>发布设置</div>
            <PlatformSelector />
            <SchedulePicker />
            <PublishTimingSuggestion />
            <PlatformPreviewPanel
              adaptations={platformDrafts}
              selectedPlatforms={selectedPlatforms}
              agentEnabled={agentEnabled}
            />
            <div style={{ marginTop: 16 }}>
              <PublishButton />
            </div>
            {overallStatus !== 'idle' && <PublishStatusPanel />}
          </div>
        </div>
      )}

      {/* Clear confirm modal */}
      {clearConfirming && (
        <div className={styles.confirmOverlay} onClick={() => setClearConfirming(false)}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.confirmTitle}>确认清空？</h2>
            <p className={styles.confirmText}>
              清空后，当前编辑器中的内容将被清除。如果已保存为草稿，可以在稿件库中找回。
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.confirmCancel}
                onClick={() => setClearConfirming(false)}
              >
                取消
              </button>
              <button type="button" className={styles.confirmDanger} onClick={handleClearConfirm}>
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomePageClient() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: '28px 36px' }}>
          <div
            style={{
              height: 22,
              width: 120,
              borderRadius: 8,
              background: 'var(--color-bg-elevated, #eee)',
            }}
          />
          <div
            style={{
              marginTop: 16,
              height: 400,
              borderRadius: 16,
              background: 'var(--color-bg-elevated, #eee)',
            }}
          />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
