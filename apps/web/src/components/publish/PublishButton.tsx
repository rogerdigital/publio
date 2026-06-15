import { useEffect, useRef, useState } from 'react';
import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { SendHorizonal, Loader2, AlertCircle } from 'lucide-react';
import { publishButton } from './publish.css';
import { useToastStore } from '@/stores/toastStore';
import PublishConfirmDialog from './PublishConfirmDialog';
import ModerationWarning from './ModerationWarning';
import type { SensitiveMatch } from '@/lib/moderation/types';
import type { PublishCheckResult } from '@/lib/publishChecks/types';

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
    variantIds,
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
  const [checkResults, setCheckResults] = useState<PublishCheckResult[] | undefined>(undefined);
  const [checkCanPublish, setCheckCanPublish] = useState(true);
  const [checkHasWarnings, setCheckHasWarnings] = useState(false);
  const [checking, setChecking] = useState(false);
  const validationErrors = notReadyPlatforms.map((p) => `${platformLabels[p]} 标题或内容为空`);

  async function runPrePublishCheck() {
    setChecking(true);
    try {
      const res = await fetch('/api/publish/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          platforms: selectedPlatforms,
          draftId: currentDraftId ?? undefined,
          variantIds: Object.fromEntries(
            selectedPlatforms.filter((p) => variantIds[p]).map((p) => [p, variantIds[p]]),
          ),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCheckResults(data.checks);
        setCheckCanPublish(data.canPublish);
        setCheckHasWarnings(data.hasWarnings);
      }
    } catch {
      // If check fails, allow publish to proceed
    } finally {
      setChecking(false);
    }
  }

  async function handlePublish() {
    if (isDisabled) return;
    if (!confirmOpen) {
      setConfirmOpen(true);
      setCheckResults(undefined);
      setCheckCanPublish(true);
      setCheckHasWarnings(false);
      runPrePublishCheck();
      return;
    }
    setConfirmOpen(false);

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
          variantIds: Object.fromEntries(
            selectedPlatforms.filter((p) => variantIds[p]).map((p) => [p, variantIds[p]]),
          ),
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
    label =
      notReadyPlatforms.length === 1
        ? `${platformLabels[notReadyPlatforms[0]]} 内容待补全`
        : `${notReadyPlatforms.length} 个平台内容待补全`;
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
        validating={checking}
        checkResults={checkResults}
        canPublish={checkCanPublish}
        hasWarnings={checkHasWarnings}
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
