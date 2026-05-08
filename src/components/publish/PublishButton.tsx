'use client';

import { useEffect, useRef, useState } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { SendHorizonal, Loader2, AlertCircle, Clock } from 'lucide-react';
import { publishButton } from './publish.css';
import { useToastStore } from '@/stores/toastStore';
import PublishConfirmDialog from './PublishConfirmDialog';
import ModerationWarning from './ModerationWarning';
import type { SensitiveMatch } from '@/lib/moderation/types';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

export default function PublishButton() {
  const {
    title,
    content,
    currentDraftId,
    platforms,
    platformDrafts,
    overallStatus,
    scheduledAt,
    setPublishing,
    setResults,
    setLastSyncTaskId,
    openProgressOverlay,
  } = usePublishStore();

  const handlePublishRef = useRef<typeof handlePublish>(null!);

  const selectedPlatforms = (Object.entries(platforms) as [PlatformId, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);

  const notReadyPlatforms = selectedPlatforms.filter((platform) => {
    const draft = platformDrafts[platform];
    return !draft?.title?.trim() || !draft?.body?.trim();
  });

  const isDisabled =
    !title.trim() ||
    !content.trim() ||
    selectedPlatforms.length === 0 ||
    notReadyPlatforms.length > 0 ||
    overallStatus === 'publishing';

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [moderationMatches, setModerationMatches] = useState<SensitiveMatch[] | null>(null);
  const [forcePublish, setForcePublish] = useState(false);
  const validationErrors = notReadyPlatforms.map((p) => `${platformLabels[p]} 标题或内容为空`);

  async function handlePublish() {
    if (isDisabled) return;
    if (!confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(false);

    // 定时发布：创建/更新草稿并设置 scheduledAt
    if (scheduledAt) {
      try {
        const body = {
          title,
          content,
          source: 'manual' as const,
          scheduledAt,
          platforms: selectedPlatforms,
        };

        if (currentDraftId) {
          await fetch(`/api/drafts/${currentDraftId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
        } else {
          const res = await fetch('/api/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });
          const data = await res.json();
          if (data.draft?.id) {
            usePublishStore.getState().setCurrentDraftId(data.draft.id);
          }
        }
        setResults(
          selectedPlatforms.map((p) => ({
            platform: p,
            status: 'success' as const,
            message: `已设定 ${new Date(scheduledAt).toLocaleString('zh-CN')} 定时发布`,
          })),
        );
      } catch (error) {
        setResults(
          selectedPlatforms.map((p) => ({
            platform: p,
            status: 'error' as const,
            message: error instanceof Error ? error.message : '设定定时发布失败',
          })),
        );
      }
      return;
    }

    setPublishing();

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftId: currentDraftId ?? undefined,
          title,
          content,
          platforms: selectedPlatforms,
          forcePublish,
          platformDrafts: Object.fromEntries(
            selectedPlatforms.map((platform) => [
              platform,
              {
                title: platformDrafts[platform].title,
                content:
                  platformDrafts[platform].aiAdapted && platformDrafts[platform].aiBody
                    ? platformDrafts[platform].aiBody
                    : platformDrafts[platform].body,
              },
            ]),
          ),
        }),
      });
      const data = (await response.json()) as
        | PublishResponse
        | { error?: string }
        | { moderationWarning: true; matches: SensitiveMatch[] };

      if (!response.ok) {
        const message = 'error' in data && data.error ? data.error : '发布失败，请稍后重试';
        throw new Error(message);
      }

      // Handle moderation warning
      if ('moderationWarning' in data && data.moderationWarning) {
        setModerationMatches(data.matches);
        return;
      }

      if (!('syncTaskId' in data)) throw new Error('发布结果格式异常，请稍后重试');
      setForcePublish(false);
      useToastStore.getState().addToast('success', '发布任务已提交');

      // 原地显示发布进度浮层，不跳转
      setLastSyncTaskId(data.syncTaskId);
      openProgressOverlay();
    } catch (error) {
      const msg = error instanceof Error ? error.message : '网络错误，请重试';
      useToastStore.getState().addToast('error', msg);
      setResults(
        selectedPlatforms.map((p) => ({
          platform: p,
          status: 'error' as const,
          message: msg,
        })),
      );
    }
  }

  handlePublishRef.current = handlePublish;

  useEffect(() => {
    function onShortcut() {
      handlePublishRef.current();
    }
    document.addEventListener('publio:publish', onShortcut);
    return () => document.removeEventListener('publio:publish', onShortcut);
  }, []);

  let label: string;
  if (overallStatus === 'publishing') {
    label = '提交中...';
  } else if (selectedPlatforms.length === 0) {
    label = '请先选择平台';
  } else if (notReadyPlatforms.length > 0) {
    label = `${notReadyPlatforms.map((p) => platformLabels[p]).join('、')} 内容待补全`;
  } else if (scheduledAt) {
    label = `定时 ${new Date(scheduledAt).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })} 发布`;
  } else {
    label = `发布到 ${selectedPlatforms.length} 个平台`;
  }

  return (
    <>
      <button
        onClick={handlePublish}
        disabled={isDisabled}
        className={publishButton({ disabled: isDisabled })}
      >
        {overallStatus === 'publishing' ? (
          <Loader2 size={15} className="animate-spin" />
        ) : scheduledAt ? (
          <Clock size={15} />
        ) : notReadyPlatforms.length > 0 ? (
          <AlertCircle size={15} />
        ) : (
          <SendHorizonal size={15} />
        )}
        {label}
      </button>

      <PublishConfirmDialog
        open={confirmOpen}
        title={title}
        platforms={selectedPlatforms}
        validationErrors={validationErrors}
        onConfirm={handlePublish}
        onCancel={() => setConfirmOpen(false)}
      />

      {moderationMatches && (
        <ModerationWarning
          matches={moderationMatches}
          onContinue={() => {
            setModerationMatches(null);
            setForcePublish(true);
            // Trigger publish again with forcePublish
            setTimeout(() => handlePublishRef.current(), 0);
          }}
          onCancel={() => {
            setModerationMatches(null);
            setForcePublish(false);
          }}
        />
      )}
    </>
  );
}
