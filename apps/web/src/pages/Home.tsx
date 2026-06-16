import { lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, SquarePen, Eraser, History, Send, MoreHorizontal, FileText } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { useAgentStore } from '@/stores/agentStore';
import AppShellHeader from '@/components/layout/AppShellHeader';

const MarkdownEditor = lazy(() => import('@/components/editor/MarkdownEditor'));
import RecentDraftBar from '@/components/editor/RecentDraftBar';
import PublishChecklist from '@/components/publish/PublishChecklist';
import TemplatePicker from '@/components/editor/TemplatePicker';
import MediaLibrary from '@/components/editor/MediaLibrary';

const PlatformVariantPanel = lazy(() => import('@/components/publish/PlatformVariantPanel'));
const PublishProgressOverlay = lazy(() => import('@/components/publish/PublishProgressOverlay'));
const VersionHistory = lazy(() => import('@/components/editor/VersionHistory'));
const AgentPanel = lazy(() => import('@/components/agent/AgentPanel'));
import * as publishStyles from '@/components/publish/publish.css';
import { fetchDraftById } from '@/lib/drafts/client';
import { getCachedHomePageChromeData, loadHomePageChromeData } from '@/lib/navigationDataCache';
import { useAutoSave } from '@/hooks/useAutoSave';
import type { PlatformId } from '@/types';
import * as styles from './page.css';

function HomePageContent() {
  const {
    title,
    content,
    platforms,
    syncPlatformDrafts,
    setTitle,
    setContent,
    reset,
    currentDraftId,
    setCurrentDraftId,
    activeTab,
    setActiveTab,
  } = usePublishStore();
  const agentStatus = useAgentStore((s) => s.status);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cachedChromeData = getCachedHomePageChromeData();
  const [draftLoadError, setDraftLoadError] = useState('');
  const [clearConfirming, setClearConfirming] = useState(false);
  const [mobilePublishOpen, setMobilePublishOpen] = useState(false);
  const [agentEnabled, setAgentEnabled] = useState(cachedChromeData?.agentEnabled ?? false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [imageBedLabel, setImageBedLabel] = useState<string | undefined>(
    cachedChromeData?.imageBedLabel,
  );

  // 检查 Agent 和图床是否已配置
  useEffect(() => {
    let cancelled = false;
    loadHomePageChromeData()
      .then((data) => {
        if (cancelled) return;
        setAgentEnabled(data.agentEnabled);
        setImageBedLabel(data.imageBedLabel);
      })
      .catch(() => {
        if (!cancelled) setAgentEnabled(false);
      });
    return () => {
      cancelled = true;
    };
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
      navigate(`/?draftId=${id}`, { replace: true });
    },
    [setCurrentDraftId, navigate],
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
    reset();
    navigate('/', { replace: true });
  }, [reset, navigate, setContent, setTitle, setCurrentDraftId]);

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
        title="写作台"
        description="写作、预览、多平台分发。"
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
            <div className={styles.moreMenuWrap}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen((v) => !v)}
                className={styles.newDraftButton}
                title="更多操作"
                aria-expanded={moreMenuOpen}
              >
                <MoreHorizontal size={15} />
              </button>
              {moreMenuOpen && (
                <>
                  <div className={styles.moreMenuBackdrop} onClick={() => setMoreMenuOpen(false)} />
                  <div className={styles.moreMenu}>
                    <TemplatePicker
                      currentTitle={title}
                      currentContent={content}
                      onSelect={(template) => {
                        setTitle(template.title);
                        setContent(template.content);
                        setMoreMenuOpen(false);
                      }}
                    />
                    <MediaLibrary
                      imageBedLabel={imageBedLabel}
                      onSelect={(url, filename) => {
                        const insertion = `\n![${filename}](${url})\n`;
                        setContent(content + insertion);
                        setMoreMenuOpen(false);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        navigate('/drafts');
                      }}
                      className={styles.moreMenuItem}
                    >
                      <FileText size={14} />
                      打开稿件库
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMoreMenuOpen(false);
                        handleClearClick();
                      }}
                      className={styles.moreMenuItemDanger}
                    >
                      <Eraser size={14} />
                      清空写作台
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        }
      />

      <div className={styles.editorLayout}>
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
            {currentDraftId && (
              <div className={publishStyles.rightPanelSection}>
                <button
                  type="button"
                  className={publishStyles.collapseToggle}
                  onClick={() => setShowVersionHistory((v) => !v)}
                  aria-expanded={showVersionHistory}
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
              <PublishChecklist />
            </div>

            {currentDraftId && (
              <div className={publishStyles.rightPanelSection}>
                <span className={publishStyles.rightPanelSectionTitle}>渠道版本</span>
                <PlatformVariantPanel
                  selectedPlatforms={selectedPlatforms}
                  agentEnabled={agentEnabled}
                />
              </div>
            )}
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
            <PublishChecklist />
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
