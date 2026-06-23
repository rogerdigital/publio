import {
  lazy,
  Suspense,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, SquarePen, Eraser, MoreHorizontal, FileText } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { useAgentStore } from '@/stores/agentStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import * as layoutStyles from '@/app/styles/layout.css';

const MarkdownEditor = lazy(() => import('@/components/editor/MarkdownEditor'));
import RecentDraftBar from '@/components/editor/RecentDraftBar';
import PublishChecklist from '@/components/publish/PublishChecklist';
import TemplatePicker from '@/components/editor/TemplatePicker';
import MediaLibrary from '@/components/editor/MediaLibrary';

const PlatformVariantPanel = lazy(() => import('@/components/publish/PlatformVariantPanel'));
const PublishProgressOverlay = lazy(() => import('@/components/publish/PublishProgressOverlay'));
const AgentPanel = lazy(() => import('@/components/agent/AgentPanel'));
import * as publishStyles from '@/components/publish/publish.css';
import { fetchDraftById } from '@/lib/drafts/client';
import { getCachedHomePageChromeData, loadHomePageChromeData } from '@/lib/navigationDataCache';
import { useManualSave } from '@/hooks/useManualSave';
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
  // 记录已加载的 draftId，防止 URL 变化但 draftId 相同时重复拉取草稿。
  const loadedDraftIdRef = useRef<string | null>(null);
  const [agentEnabled, setAgentEnabled] = useState(cachedChromeData?.agentEnabled ?? false);
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
      // 标记该 draftId 已"加载"，防止紧接着的 URL 变化触发 loadDraft effect
      // 重新拉取并覆盖用户内容。
      loadedDraftIdRef.current = id;
      navigate(`/?draftId=${id}`, { replace: true });
    },
    [setCurrentDraftId, navigate],
  );

  const { save, syncSnapshot } = useManualSave({
    title,
    content,
    draftId: currentDraftId,
    onDraftCreated: handleDraftCreated,
  });

  const handleNewDraft = useCallback(() => {
    setTitle('');
    setContent('');
    setCurrentDraftId(null);
    loadedDraftIdRef.current = null;
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
    const timer = setTimeout(() => syncPlatformDrafts(), 500);
    return () => clearTimeout(timer);
  }, [deferredContent, deferredTitle, syncPlatformDrafts]);

  useEffect(() => {
    const draftId = searchParams.get('draftId');
    if (!draftId) return;
    // 首次保存创建草稿后会 navigate('/?draftId=xxx')，URL 变化但 draftId 相同。
    // 用 ref 记录上次加载的 draftId，相同则跳过重新拉取，避免覆盖用户可能已继续
    // 输入的内容、以及由此引发的页面闪烁。
    if (loadedDraftIdRef.current === draftId) return;
    loadedDraftIdRef.current = draftId;

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
        // 载入后同步快照为载入值，避免误判 dirty。
        syncSnapshot({ title: draft.title, content: draft.content });
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
  }, [reset, searchParams, setContent, setTitle, setCurrentDraftId, syncSnapshot]);

  return (
    <div className={styles.pageWrap}>
      <AppShellHeader
        title="写作台"
        description="写作、预览、多平台分发。"
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

      <div className={layoutStyles.scrollArea}>
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

              <div className={styles.editorCard({ preview: activeTab === 'preview' })}>
                <MarkdownEditor activeTab={activeTab} onSave={save} agentEnabled={agentEnabled} />
              </div>

              {agentStatus !== 'idle' && (
                <Suspense fallback={null}>
                  <AgentPanel />
                </Suspense>
              )}

              {/* 发布区：编辑区下方 */}
              <div className={styles.publishPanel}>
                <div className={publishStyles.rightPanelSection}>
                  <PublishChecklist />
                </div>

                {currentDraftId && (
                  <div className={publishStyles.rightPanelSection}>
                    <span className={publishStyles.rightPanelSectionTitle}>渠道版本</span>
                    <Suspense fallback={null}>
                      <PlatformVariantPanel
                        selectedPlatforms={selectedPlatforms}
                        agentEnabled={agentEnabled}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <PublishProgressOverlay />
      </Suspense>

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
