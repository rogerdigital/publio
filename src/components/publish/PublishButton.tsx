'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { Send, Loader2 } from 'lucide-react';

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
      const data: PublishResponse = await response.json();
      setResults(data.results);
    } catch {
      setResults(
        selectedPlatforms.map((p) => ({
          platform: p,
          status: 'error' as const,
          message: '网络错误，请重试',
        }))
      );
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isDisabled}
      className={`flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg text-white font-medium text-sm transition-all ${
        isDisabled
          ? 'bg-[#eadfd3] text-[#b1a295] cursor-not-allowed'
          : 'bg-[linear-gradient(90deg,#ef6b38_0%,#d87843_100%)] hover:brightness-105 shadow-[0_14px_28px_rgba(215,120,67,0.22)] active:scale-[0.98]'
      }`}
    >
      {overallStatus === 'publishing' ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          发布中...
        </>
      ) : (
        <>
          <Send size={18} />
          一键发布到 {selectedPlatforms.length} 个平台
        </>
      )}
    </button>
  );
}
