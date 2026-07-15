import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Sparkles, Bot, Pencil, GitCommitHorizontal, CheckCircle2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import type { PlatformVariant, VariantStatus } from '@/lib/platformVariants/types';
import { getPlatformReadiness } from '@/lib/publishChecks/platformReadiness';
import {
  getVariantFreshnessLabel,
  shouldConfirmVariantReplacement,
} from '@/lib/platformVariants/presentation';
import { validateForPlatform } from '@/lib/platformRules/validate';
import PlatformSelector from './PlatformSelector';
import PublishButton from './PublishButton';
import PublishStatusPanel from './PublishStatusPanel';
import PlatformAdaptButton from './PlatformAdaptButton';
import * as styles from './PublishChecklist.css';

const platformLabels: Record<PlatformId, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.id, p.name]),
) as Record<PlatformId, string>;

const READINESS_LABELS: Record<string, string> = {
  ready: '可发布',
  'needs-content': '内容待补全',
  'needs-review': '需注意',
  'needs-adapt': '需要适配',
  unconfigured: '未配置',
  publishing: '发布中',
  success: '已发布',
  failed: '发布失败',
};

const statusLabels: Record<VariantStatus, string> = {
  synced: '已同步',
  adapted: 'AI 适配',
  edited: '已编辑',
  checked: '已检查',
  scheduled: '已排期',
  published: '已发布',
};

interface VariantCardData {
  id: string;
  platform: PlatformId;
  title: string;
  content: string;
  status: VariantStatus;
  generatedByAgent: boolean;
  manuallyEdited: boolean;
  sourceDraftRevision: number;
  stale: boolean;
  changeSummary?: string;
}

function toVariantCardData(variant: PlatformVariant): VariantCardData {
  return {
    id: variant.id,
    platform: variant.platform,
    title: variant.title,
    content: variant.content,
    status: variant.status,
    generatedByAgent: variant.generatedByAgent,
    manuallyEdited: variant.manuallyEdited,
    sourceDraftRevision: variant.sourceDraftRevision,
    stale: variant.stale,
    changeSummary: variant.changeSummary,
  };
}

interface PublishChecklistProps {
  agentEnabled?: boolean;
}

export default function PublishChecklist({ agentEnabled = false }: PublishChecklistProps) {
  const {
    platforms,
    platformDrafts,
    overallStatus,
    results,
    currentDraftId,
    title,
    content,
    variantIds,
    setVariantId,
    resetVariantIds,
  } = usePublishStore();

  const selectedPlatforms = useMemo(
    () =>
      (Object.entries(platforms) as [PlatformId, boolean][])
        .filter(([, selected]) => selected)
        .map(([id]) => id),
    [platforms],
  );

  // --- variant 数据与操作（迁移自 PlatformVariantPanel）---
  const [variants, setVariants] = useState<Record<string, VariantCardData>>({});
  const [editingPlatform, setEditingPlatform] = useState<PlatformId | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [regeneratingPlatforms, setRegeneratingPlatforms] = useState<
    Partial<Record<PlatformId, boolean>>
  >({});
  const [mutatingPlatforms, setMutatingPlatforms] = useState<Partial<Record<PlatformId, boolean>>>(
    {},
  );
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const editTitleRef = useRef('');
  const editContentRef = useRef('');
  const requestGenerationRef = useRef(0);
  const requestControllerRef = useRef<AbortController | null>(null);
  const regenerationLifecycleRef = useRef(0);
  const regenerationOperationRef = useRef<Partial<Record<PlatformId, number>>>({});
  const regenerationControllerRef = useRef<Partial<Record<PlatformId, AbortController>>>({});
  const regeneratingPlatformsRef = useRef<Set<PlatformId>>(new Set());
  const mutationSequenceRef = useRef<Partial<Record<PlatformId, number>>>({});
  const activeMutationRef = useRef<Partial<Record<PlatformId, number>>>({});
  const mutatingPlatformsRef = useRef<Set<PlatformId>>(new Set());
  const manualSaveGenerationRef = useRef<Partial<Record<PlatformId, number>>>({});
  const manualSaveControllerRef = useRef<Partial<Record<PlatformId, AbortController>>>({});
  const activeDraftIdRef = useRef(currentDraftId);

  const invalidateVariantRequest = useCallback(() => {
    requestGenerationRef.current += 1;
    requestControllerRef.current?.abort();
    requestControllerRef.current = null;
  }, []);

  const invalidateRegenerationRequests = useCallback(() => {
    regenerationLifecycleRef.current += 1;
    for (const controller of Object.values(regenerationControllerRef.current)) {
      controller?.abort();
    }
    regenerationControllerRef.current = {};
    regeneratingPlatformsRef.current.clear();
  }, []);

  const invalidateVariantMutations = useCallback(() => {
    for (const controller of Object.values(manualSaveControllerRef.current)) {
      controller?.abort();
    }
    manualSaveControllerRef.current = {};
    activeMutationRef.current = {};
    mutatingPlatformsRef.current.clear();
  }, []);

  const beginVariantMutation = useCallback(
    (platform: PlatformId): number | null => {
      if (
        mutatingPlatformsRef.current.has(platform) ||
        regeneratingPlatformsRef.current.has(platform)
      ) {
        return null;
      }

      invalidateVariantRequest();
      const operation = (mutationSequenceRef.current[platform] ?? 0) + 1;
      mutationSequenceRef.current[platform] = operation;
      activeMutationRef.current[platform] = operation;
      mutatingPlatformsRef.current.add(platform);
      setMutatingPlatforms((current) => ({ ...current, [platform]: true }));
      return operation;
    },
    [invalidateVariantRequest],
  );

  const applyVariantMutation = useCallback(
    (platform: PlatformId, variant: PlatformVariant, operation: number): boolean => {
      if (
        activeMutationRef.current[platform] !== operation ||
        activeDraftIdRef.current !== variant.draftId ||
        variant.platform !== platform
      ) {
        return false;
      }

      setVariantId(platform, variant.id);
      setVariants((current) => ({ ...current, [platform]: toVariantCardData(variant) }));
      return true;
    },
    [setVariantId],
  );

  const endVariantMutation = useCallback((platform: PlatformId, operation: number) => {
    if (activeMutationRef.current[platform] !== operation) return;
    delete activeMutationRef.current[platform];
    mutatingPlatformsRef.current.delete(platform);
    setMutatingPlatforms((current) => {
      if (!current[platform]) return current;
      const next = { ...current };
      delete next[platform];
      return next;
    });
  }, []);

  useLayoutEffect(() => {
    activeDraftIdRef.current = currentDraftId;
    invalidateVariantRequest();
    invalidateRegenerationRequests();
    invalidateVariantMutations();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = undefined;
    setVariants({});
    setRegeneratingPlatforms({});
    setMutatingPlatforms({});
    setEditingPlatform(null);
    setEditTitle('');
    setEditContent('');
    resetVariantIds();

    return () => {
      invalidateVariantRequest();
      invalidateRegenerationRequests();
      invalidateVariantMutations();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    currentDraftId,
    invalidateRegenerationRequests,
    invalidateVariantMutations,
    invalidateVariantRequest,
    resetVariantIds,
  ]);

  const fetchVariants = useCallback(async () => {
    const requestedDraftId = currentDraftId;
    if (!requestedDraftId || activeDraftIdRef.current !== requestedDraftId) return;

    invalidateRegenerationRequests();
    invalidateVariantMutations();
    setRegeneratingPlatforms({});
    setMutatingPlatforms({});
    requestControllerRef.current?.abort();
    const controller = new AbortController();
    const generation = requestGenerationRef.current + 1;
    requestGenerationRef.current = generation;
    requestControllerRef.current = controller;
    const isCurrentRequest = () =>
      requestGenerationRef.current === generation &&
      activeDraftIdRef.current === requestedDraftId &&
      !controller.signal.aborted;

    try {
      const res = await fetch(`/api/drafts/${requestedDraftId}/variants`, {
        signal: controller.signal,
      });
      if (!res.ok || !isCurrentRequest()) return;
      const data = await res.json();
      if (!isCurrentRequest()) return;

      const map: Record<string, VariantCardData> = {};
      resetVariantIds();
      for (const v of data.variants as PlatformVariant[]) {
        map[v.platform] = toVariantCardData(v);
        setVariantId(v.platform, v.id);
      }
      setVariants(map);
    } catch {
      // 切换稿件会主动中止旧请求；网络失败沿用空状态。
    } finally {
      if (requestControllerRef.current === controller) requestControllerRef.current = null;
    }
  }, [
    currentDraftId,
    invalidateRegenerationRequests,
    invalidateVariantMutations,
    resetVariantIds,
    setVariantId,
  ]);

  useEffect(() => {
    void fetchVariants();
  }, [fetchVariants]);

  const handleResync = useCallback(
    async (platform: PlatformId) => {
      const requestedDraftId = currentDraftId;
      if (!requestedDraftId || activeDraftIdRef.current !== requestedDraftId) return;
      if (
        regeneratingPlatformsRef.current.has(platform) ||
        mutatingPlatformsRef.current.has(platform) ||
        editingPlatform === platform
      ) {
        return;
      }
      const currentVariant = variants[platform];
      if (
        currentVariant &&
        shouldConfirmVariantReplacement(currentVariant) &&
        !window.confirm('重新生成会覆盖这个渠道版本的人工或 AI 修改，是否继续？')
      ) {
        return;
      }

      invalidateVariantRequest();
      const lifecycle = regenerationLifecycleRef.current;
      const operation = (regenerationOperationRef.current[platform] ?? 0) + 1;
      regenerationOperationRef.current[platform] = operation;
      regenerationControllerRef.current[platform]?.abort();
      const controller = new AbortController();
      regenerationControllerRef.current[platform] = controller;
      regeneratingPlatformsRef.current.add(platform);
      setRegeneratingPlatforms((current) => ({ ...current, [platform]: true }));

      const isCurrentOperation = () =>
        regenerationLifecycleRef.current === lifecycle &&
        regenerationOperationRef.current[platform] === operation &&
        regenerationControllerRef.current[platform] === controller &&
        activeDraftIdRef.current === requestedDraftId &&
        !controller.signal.aborted;

      try {
        const res = await fetch(`/api/drafts/${requestedDraftId}/variants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platforms: [platform], force: true }),
          signal: controller.signal,
        });
        if (!res.ok || !isCurrentOperation()) return;
        const data = await res.json();
        if (!isCurrentOperation()) return;
        const v = data.variants?.[0] as PlatformVariant | undefined;
        if (v) {
          setVariantId(platform, v.id);
          setVariants((current) => ({ ...current, [platform]: toVariantCardData(v) }));
        }
      } catch {
        // 稿件切换或新数据请求会主动中止过期的重新生成。
      } finally {
        if (regenerationControllerRef.current[platform] === controller) {
          delete regenerationControllerRef.current[platform];
          regeneratingPlatformsRef.current.delete(platform);
          setRegeneratingPlatforms((current) => {
            if (!current[platform]) return current;
            const next = { ...current };
            delete next[platform];
            return next;
          });
        }
      }
    },
    [currentDraftId, editingPlatform, invalidateVariantRequest, variants, setVariantId],
  );

  const startEdit = useCallback(
    (platform: PlatformId) => {
      const v = variants[platform];
      if (
        !v ||
        mutatingPlatformsRef.current.has(platform) ||
        regeneratingPlatformsRef.current.has(platform)
      ) {
        return;
      }

      if (editingPlatform !== null && editingPlatform !== platform) {
        if (activeMutationRef.current[editingPlatform] !== undefined) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = undefined;
        manualSaveControllerRef.current[editingPlatform]?.abort();
        delete manualSaveControllerRef.current[editingPlatform];
        manualSaveGenerationRef.current[editingPlatform] =
          (manualSaveGenerationRef.current[editingPlatform] ?? 0) + 1;
      }

      setEditingPlatform(platform);
      setEditTitle(v.title);
      setEditContent(v.content);
      editTitleRef.current = v.title;
      editContentRef.current = v.content;
    },
    [editingPlatform, variants],
  );

  const saveEdit = useCallback(
    async (platform: PlatformId, generation: number) => {
      const requestedDraftId = currentDraftId;
      const variantId = variantIds[platform];
      const operation = activeMutationRef.current[platform];
      if (
        !variantId ||
        !requestedDraftId ||
        operation === undefined ||
        activeDraftIdRef.current !== requestedDraftId ||
        manualSaveGenerationRef.current[platform] !== generation
      ) {
        return;
      }

      manualSaveControllerRef.current[platform]?.abort();
      const controller = new AbortController();
      manualSaveControllerRef.current[platform] = controller;
      const isCurrentSave = () =>
        activeMutationRef.current[platform] === operation &&
        manualSaveGenerationRef.current[platform] === generation &&
        manualSaveControllerRef.current[platform] === controller &&
        activeDraftIdRef.current === requestedDraftId &&
        !controller.signal.aborted;

      try {
        const response = await fetch(`/api/platform-variants/${variantId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editTitleRef.current,
            content: editContentRef.current,
          }),
          signal: controller.signal,
        });
        if (!response.ok || !isCurrentSave()) return;
        const data = await response.json();
        if (!isCurrentSave()) return;
        const savedVariant = data.variant as PlatformVariant | undefined;
        if (!savedVariant || !applyVariantMutation(platform, savedVariant, operation)) return;

        setEditingPlatform(null);
        endVariantMutation(platform, operation);
      } catch {
        // 新输入或稿件切换会主动中止过期保存；失败时保留编辑状态。
      } finally {
        if (manualSaveControllerRef.current[platform] === controller) {
          delete manualSaveControllerRef.current[platform];
        }
      }
    },
    [applyVariantMutation, currentDraftId, endVariantMutation, variantIds],
  );

  const scheduleManualSave = useCallback(
    (platform: PlatformId) => {
      manualSaveControllerRef.current[platform]?.abort();
      const generation = (manualSaveGenerationRef.current[platform] ?? 0) + 1;
      manualSaveGenerationRef.current[platform] = generation;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = undefined;
        void saveEdit(platform, generation);
      }, 800);
    },
    [saveEdit],
  );

  const ensureManualEditMutation = useCallback(
    (platform: PlatformId): boolean => {
      if (editingPlatform !== platform) return false;
      if (activeMutationRef.current[platform] !== undefined) return true;
      return beginVariantMutation(platform) !== null;
    },
    [beginVariantMutation, editingPlatform],
  );

  const handleEditContentChange = useCallback(
    (platform: PlatformId, value: string) => {
      if (!ensureManualEditMutation(platform)) return;
      setEditContent(value);
      editContentRef.current = value;
      scheduleManualSave(platform);
    },
    [ensureManualEditMutation, scheduleManualSave],
  );

  const handleEditTitleChange = useCallback(
    (platform: PlatformId, value: string) => {
      if (!ensureManualEditMutation(platform)) return;
      setEditTitle(value);
      editTitleRef.current = value;
      scheduleManualSave(platform);
    },
    [ensureManualEditMutation, scheduleManualSave],
  );

  // --- 就绪状态（决定徽章）---
  const readinessItems = useMemo(
    () =>
      selectedPlatforms.map((platform) => {
        const draft = platformDrafts[platform];
        // 与平台预览面板一致：优先用 AI 适配后的内容做校验
        const displayTitle = draft?.title ?? '';
        const displayBody = draft?.aiAdapted && draft?.aiBody ? draft.aiBody : (draft?.body ?? '');
        const result = results.find((r) => r.platform === platform);
        return getPlatformReadiness(
          platform,
          displayTitle,
          displayBody,
          overallStatus,
          result ? { status: result.status, message: result.message } : undefined,
        );
      }),
    [selectedPlatforms, platformDrafts, overallStatus, results],
  );

  return (
    <div className={styles.checklist}>
      {/* Step 1: 选择平台 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>1</span>
          <span className={styles.stepTitle}>选择平台</span>
        </div>
        <div className={styles.stepContent}>
          <PlatformSelector />
        </div>
      </div>

      {/* Step 2: 检查就绪（整合渠道版本：每平台一张详细卡片） */}
      {selectedPlatforms.length > 0 && (
        <div className={styles.step}>
          <div className={styles.stepHeader}>
            <span className={styles.stepNumber}>2</span>
            <span className={styles.stepTitle}>检查就绪</span>
          </div>
          <div className={`${styles.stepContent} ${styles.platformCards}`}>
            {readinessItems.map((item) => {
              const platform = item.platform;
              const variant = variants[platform];
              const draft = platformDrafts[platform];
              const isEditing = editingPlatform === platform;
              const displayTitle = isEditing
                ? editTitle
                : (variant?.title ?? draft?.title ?? title);
              const displayContent = isEditing
                ? editContent
                : (variant?.content ?? draft?.body ?? content);
              const wordCount = displayContent.replace(/\s/g, '').length;
              const validation = validateForPlatform(displayTitle, displayContent, platform);
              const hasVariant = !!currentDraftId && !!variant;
              const freshnessLabel = variant ? getVariantFreshnessLabel(variant) : null;
              const isPlatformBusy =
                regeneratingPlatforms[platform] === true ||
                mutatingPlatforms[platform] === true ||
                isEditing;
              const isOtherEditorLocked =
                editingPlatform !== null &&
                editingPlatform !== platform &&
                mutatingPlatforms[editingPlatform] === true;

              return (
                <div key={platform} className={styles.variantCard}>
                  {/* 头部：平台名 + 就绪徽章 + variant 状态 */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardHeaderLeft}>
                      <span className={styles.cardPlatformName}>{platformLabels[platform]}</span>
                      <span className={styles.readinessVariants[item.status]}>
                        {READINESS_LABELS[item.status]}
                      </span>
                      {hasVariant && (
                        <span className={styles.variantStatusBadge[variant.status]}>
                          {statusLabels[variant.status]}
                        </span>
                      )}
                      {freshnessLabel && (
                        <span className={styles.staleBadge}>{freshnessLabel}</span>
                      )}
                    </div>
                    {/* 校验原因（需注意/待补全时展示具体问题） */}
                    {item.message &&
                      (item.status === 'needs-review' || item.status === 'needs-content') && (
                        <span className={styles.platformReason}>{item.message}</span>
                      )}
                  </div>

                  {/* variant 来源标签 */}
                  {hasVariant && (
                    <div className={styles.cardMeta}>
                      {variant.generatedByAgent && (
                        <span className={styles.metaTag}>
                          <Bot size={10} /> Agent
                        </span>
                      )}
                      {variant.manuallyEdited && (
                        <span className={styles.metaTag}>
                          <Pencil size={10} /> 手动编辑
                        </span>
                      )}
                      {!variant.generatedByAgent && !variant.manuallyEdited && (
                        <span className={styles.metaTag}>
                          <GitCommitHorizontal size={10} /> 主稿同步
                        </span>
                      )}
                    </div>
                  )}

                  {/* AI 适配变更摘要 */}
                  {variant?.changeSummary && (
                    <div className={styles.changeSummary}>
                      <Sparkles size={10} /> {variant.changeSummary}
                    </div>
                  )}

                  {/* 内容编辑区 */}
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        className={styles.titleInput}
                        value={editTitle}
                        onChange={(e) => handleEditTitleChange(platform, e.target.value)}
                        placeholder="标题"
                      />
                      <textarea
                        className={styles.contentArea}
                        value={editContent}
                        onChange={(e) => handleEditContentChange(platform, e.target.value)}
                        placeholder="正文"
                      />
                    </>
                  ) : (
                    hasVariant && (
                      <textarea
                        className={styles.contentArea}
                        value={displayContent}
                        readOnly
                        onClick={() => startEdit(platform)}
                        aria-disabled={isOtherEditorLocked}
                        style={{
                          cursor: isOtherEditorLocked ? 'not-allowed' : 'pointer',
                          minHeight: '60px',
                        }}
                      />
                    )
                  )}

                  {/* 校验明细 */}
                  {validation.issues.length > 0 ? (
                    <ul className={styles.validationList}>
                      {validation.issues.map((issue, i) => (
                        <li key={i}>
                          {issue.message}
                          {issue.current !== undefined && issue.limit !== undefined
                            ? ` (${issue.current}/${issue.limit})`
                            : ''}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    displayContent.trim() && (
                      <span className={styles.passedHint}>
                        <CheckCircle2 size={11} /> 符合 {platformLabels[platform]} 要求
                      </span>
                    )
                  )}

                  {/* 操作区 */}
                  <div className={styles.cardActions}>
                    {hasVariant && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => handleResync(platform)}
                        disabled={isPlatformBusy}
                        title="从主稿重新同步"
                      >
                        <RefreshCw size={10} /> 同步
                      </button>
                    )}
                    <PlatformAdaptButton
                      platform={platform}
                      agentEnabled={agentEnabled}
                      disabled={isPlatformBusy}
                      onMutationStart={beginVariantMutation}
                      onVariantSaved={applyVariantMutation}
                      onMutationEnd={endVariantMutation}
                    />
                    {hasVariant && !isEditing && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => startEdit(platform)}
                        disabled={isPlatformBusy || isOtherEditorLocked}
                        title="编辑渠道版本"
                      >
                        <Pencil size={10} /> 编辑
                      </button>
                    )}
                    <span className={styles.wordCount}>{wordCount} 字</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 3: 发布 */}
      <div className={styles.step}>
        <div className={styles.stepHeader}>
          <span className={styles.stepNumber}>3</span>
          <span className={styles.stepTitle}>发布</span>
        </div>
        <div className={styles.stepContent}>
          <div className={styles.publishAction}>
            <PublishButton />
          </div>
          {overallStatus !== 'idle' && <PublishStatusPanel />}
          {results.some((r) => r.status === 'error') && (
            <div className={styles.failureGuidance}>
              {results
                .filter((r) => r.status === 'error')
                .map((r) => (
                  <div key={r.platform} className={styles.failureItem}>
                    <span className={styles.failurePlatform}>{platformLabels[r.platform]}</span>
                    <span className={styles.failureMessage}>{r.message || '发布失败'}</span>
                  </div>
                ))}
            </div>
          )}
          {results.some((r) => r.status === 'success') && (
            <a href="/drafts" className={styles.resultLink}>
              查看分发记录 →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
