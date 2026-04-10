'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { SendHorizonal, Loader2 } from 'lucide-react';
import { publishButton } from './publish.css';

export default function PublishButton() {
  const { title, content, platforms, overallStatus, setPublishing, setResults } =
    usePublishStore();

  const selectedPlatforms = (
    Object.entries(platforms) as [PlatformId, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([id]) => id);

  const isDisabled =
    !title.trim() ||
    !content.trim() ||
    selectedPlatforms.length === 0 ||
    overallStatus === 'publishing';

  async function handlePublish() {
    if (isDisabled) return;
    setPublishing();

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, platforms: selectedPlatforms }),
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

  const label =
    overallStatus === 'publishing'
      ? '发布中...'
      : selectedPlatforms.length === 0
      ? '请先选择平台'
      : `发布到 ${selectedPlatforms.length} 个平台`;

  return (
    <button
      onClick={handlePublish}
      disabled={isDisabled}
      className={publishButton({ disabled: isDisabled })}
    >
      {overallStatus === 'publishing' ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <SendHorizonal size={15} />
      )}
      {label}
    </button>
  );
}
