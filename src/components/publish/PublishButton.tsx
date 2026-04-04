'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PlatformId, PublishResponse } from '@/types';
import { SendHorizonal, Loader2, Rocket } from 'lucide-react';

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
  const targetLabel =
    selectedPlatforms.length === 0
      ? '先选择路由'
      : `下发到 ${selectedPlatforms.length} 个渠道`;
  const statusLabel =
    overallStatus === 'publishing'
      ? '正在排队投递'
      : isDisabled
      ? '请先完成标题、正文和路由配置'
      : '进入分发';

  async function handlePublish() {
    if (isDisabled) return;
    setPublishing();

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, platforms: selectedPlatforms }),
      });
      const data = (await response.json()) as
        | PublishResponse
        | { error?: string };

      if (!response.ok) {
        const message =
          'error' in data && data.error
            ? data.error
            : '发布失败，请稍后重试';
        throw new Error(message);
      }

      if (!('results' in data)) {
        throw new Error('发布结果格式异常，请稍后重试');
      }

      setResults(data.results);
    } catch (error) {
      setResults(
        selectedPlatforms.map((p) => ({
          platform: p,
          status: 'error' as const,
          message:
            error instanceof Error ? error.message : '网络错误，请重试',
        }))
      );
    }
  }

  return (
    <button
      onClick={handlePublish}
      disabled={isDisabled}
      className={`group flex w-full items-center justify-between gap-4 rounded-[24px] border px-5 py-4 text-left transition-all sm:px-6 ${
        isDisabled
          ? 'cursor-not-allowed border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.72)] text-[color:var(--wb-text-muted)]'
          : 'border-[color:var(--wb-border-strong)] bg-[linear-gradient(180deg,rgba(239,107,56,0.98)_0%,rgba(215,120,67,0.98)_100%)] text-white shadow-[0_18px_34px_rgba(215,120,67,0.26)] hover:-translate-y-0.5 hover:shadow-[0_22px_42px_rgba(215,120,67,0.28)] active:translate-y-0'
      }`}
    >
      <div className="flex min-w-0 items-start gap-3">
        <div
          className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
            isDisabled
              ? 'border-[color:var(--wb-border)] bg-white/80 text-[color:var(--wb-text-muted)]'
              : 'border-white/20 bg-white/10 text-white'
          }`}
        >
          {overallStatus === 'publishing' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Rocket size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p
            className={`text-[11px] font-medium uppercase tracking-[0.34em] ${
              isDisabled
                ? 'text-[color:var(--wb-accent)]'
                : 'text-white/75'
            }`}
          >
            Distribution action
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-[17px] font-medium leading-none">
              {overallStatus === 'publishing'
                ? '发布指令已发出'
                : targetLabel}
            </span>
            {overallStatus !== 'publishing' && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ${
                  isDisabled
                    ? 'border-[color:var(--wb-border)] bg-white/80 text-[color:var(--wb-text-muted)]'
                    : 'border-white/20 bg-white/10 text-white/90'
                }`}
              >
                {statusLabel}
              </span>
            )}
          </div>
          <p
            className={`mt-2 text-sm leading-6 ${
              isDisabled ? 'text-[color:var(--wb-text-muted)]' : 'text-white/80'
            }`}
          >
            {overallStatus === 'publishing'
              ? '系统正在同步提交给已选平台，等待各站点回执。'
              : '标题、正文与路由都到位后，这里就会变成真正的发稿指令。'}
          </p>
        </div>
      </div>

      <div
        className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium ${
          isDisabled
            ? 'border-[color:var(--wb-border)] bg-white/70 text-[color:var(--wb-text-muted)]'
            : 'border-white/20 bg-white/10 text-white/90'
        }`}
      >
        {overallStatus === 'publishing' ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <SendHorizonal size={15} />
        )}
        {overallStatus === 'publishing' ? '下发中' : '执行发布'}
      </div>
    </button>
  );
}
