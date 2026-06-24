import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RefreshCw, Sparkles, Bot, Pencil, GitCommitHorizontal, CheckCircle2 } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import type { PlatformVariant, VariantStatus } from '@/lib/platformVariants/types';
import { getPlatformReadiness } from '@/lib/publishChecks/platformReadiness';
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
  changeSummary?: string;
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
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchVariants = useCallback(async () => {
    if (!currentDraftId) return;
    const res = await fetch(`/api/drafts/${currentDraftId}/variants`);
    if (!res.ok) return;
    const data = await res.json();
    const map: Record<string, VariantCardData> = {};
    for (const v of data.variants as PlatformVariant[]) {
      map[v.platform] = {
        id: v.id,
        platform: v.platform,
        title: v.title,
        content: v.content,
        status: v.status,
        generatedByAgent: v.generatedByAgent,
        manuallyEdited: v.manuallyEdited,
        changeSummary: v.changeSummary,
      };
      setVariantId(v.platform, v.id);
    }
    setVariants(map);
  }, [currentDraftId, setVariantId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const handleResync = useCallback(
    async (platform: PlatformId) => {
      if (!currentDraftId) return;
      const res = await fetch(`/api/drafts/${currentDraftId}/variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platforms: [platform] }),
      });
      if (res.ok) {
        const data = await res.json();
        const v = data.variants?.[0];
        if (v) {
          await fetch(`/api/platform-variants/${v.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title,
              content,
              status: 'synced',
              manuallyEdited: false,
              generatedByAgent: false,
            }),
          });
          setVariantId(platform, v.id);
          fetchVariants();
        }
      }
    },
    [currentDraftId, title, content, setVariantId, fetchVariants],
  );

  const startEdit = useCallback(
    (platform: PlatformId) => {
      const v = variants[platform];
      if (!v) return;
      setEditingPlatform(platform);
      setEditTitle(v.title);
      setEditContent(v.content);
    },
    [variants],
  );

  const saveEdit = useCallback(
    async (platform: PlatformId) => {
      const variantId = variantIds[platform];
      if (!variantId) return;
      await fetch(`/api/platform-variants/${variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
        }),
      });
      setEditingPlatform(null);
      fetchVariants();
    },
    [variantIds, editTitle, editContent, fetchVariants],
  );

  const handleEditContentChange = useCallback(
    (platform: PlatformId, value: string) => {
      setEditContent(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveEdit(platform), 800);
    },
    [saveEdit],
  );

  const handleEditTitleChange = useCallback(
    (platform: PlatformId, value: string) => {
      setEditTitle(value);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => saveEdit(platform), 800);
    },
    [saveEdit],
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
                        style={{ cursor: 'pointer', minHeight: '60px' }}
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
                        title="从主稿重新同步"
                      >
                        <RefreshCw size={10} /> 同步
                      </button>
                    )}
                    <PlatformAdaptButton platform={platform} agentEnabled={agentEnabled} />
                    {hasVariant && !isEditing && (
                      <button
                        type="button"
                        className={styles.actionBtn}
                        onClick={() => startEdit(platform)}
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
