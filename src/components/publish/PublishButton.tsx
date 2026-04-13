'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { SendHorizonal, Loader2, AlertCircle } from 'lucide-react';
import { publishButton } from './publish.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

export default function PublishButton() {
  const { title, content, platforms, platformDrafts, overallStatus, setPublishing, setResults } =
    usePublishStore();

  const selectedPlatforms = (
    Object.entries(platforms) as [PlatformId, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);

  // Platforms whose draft title or body is empty
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

  async function handlePublish() {
    if (isDisabled) return;
    setPublishing();

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          platforms: selectedPlatforms,
          platformDrafts: Object.fromEntries(
            selectedPlatforms.map((platform) => [
              platform,
              {
                title: platformDrafts[platform].title,
                content: platformDrafts[platform].body,
              },
            ]),
          ),
        }),
      });
      const data = (await response.json()) as PublishResponse | { error?: string };

      if (!response.ok) {
        const message = 'error' in data && data.error ? data.error : '发布失败，请稍后重试';
        throw new Error(message);
      }

      if (!('results' in data)) throw new Error('发布结果格式异常，请稍后重试');

      setResults(data.results);
    } catch (error) {
      setResults(
        selectedPlatforms.map((p) => ({
          platform: p,
          status: 'error' as const,
          message: error instanceof Error ? error.message : '网络错误，请重试',
        })),
      );
    }
  }

  let label: string;
  if (overallStatus === 'publishing') {
    label = '发布中...';
  } else if (selectedPlatforms.length === 0) {
    label = '请先选择平台';
  } else if (notReadyPlatforms.length > 0) {
    label = `${notReadyPlatforms.map((p) => platformLabels[p]).join('、')} 内容待补全`;
  } else {
    label = `发布到 ${selectedPlatforms.length} 个平台`;
  }

  return (
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
  );
}
