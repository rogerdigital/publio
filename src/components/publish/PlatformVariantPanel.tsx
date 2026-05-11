'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RefreshCw, Sparkles, Bot, Pencil, GitCommitHorizontal } from 'lucide-react';
import { usePublishStore } from '@/stores/publishStore';
import { validateForPlatform } from '@/lib/platformRules/validate';
import type { PlatformId, PlatformVariant, VariantStatus } from '@/types';
import PlatformAdaptButton from './PlatformAdaptButton';
import * as styles from './PlatformVariantPanel.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
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

interface PlatformVariantPanelProps {
  selectedPlatforms: PlatformId[];
  agentEnabled?: boolean;
}

export default function PlatformVariantPanel({
  selectedPlatforms,
  agentEnabled = false,
}: PlatformVariantPanelProps) {
  const { currentDraftId, variantIds, setVariantId, title, content } = usePublishStore();
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

  if (!currentDraftId || selectedPlatforms.length === 0) return null;

  return (
    <div className={styles.container}>
      {selectedPlatforms.map((platform) => {
        const variant = variants[platform];
        const isEditing = editingPlatform === platform;
        const displayTitle = isEditing ? editTitle : (variant?.title ?? title);
        const displayContent = isEditing ? editContent : (variant?.content ?? content);
        const wordCount = displayContent.replace(/\s/g, '').length;
        const validation = validateForPlatform(displayTitle, displayContent, platform);

        return (
          <div key={platform} className={styles.variantCard}>
            <div className={styles.cardHeader}>
              <span className={styles.platformName}>{platformLabels[platform]}</span>
              {variant && (
                <span className={styles.statusBadge[variant.status]}>
                  {statusLabels[variant.status]}
                </span>
              )}
            </div>

            {variant && (
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

            {variant?.changeSummary && (
              <div className={styles.changeSummary}>
                <Sparkles size={10} /> {variant.changeSummary}
              </div>
            )}

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
              variant && (
                <textarea
                  className={styles.contentArea}
                  value={displayContent}
                  readOnly
                  onClick={() => startEdit(platform)}
                  style={{ cursor: 'pointer', minHeight: '60px' }}
                />
              )
            )}

            {validation.issues.length > 0 && (
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
            )}

            <div className={styles.cardActions}>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => handleResync(platform)}
                title="从主稿重新同步"
              >
                <RefreshCw size={10} /> 同步
              </button>
              <PlatformAdaptButton platform={platform} agentEnabled={agentEnabled} />
              {variant && !isEditing && (
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
  );
}
