'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS } from '@/types';
import {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

const iconMap = {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
};

export default function PublishStatusPanel() {
  const { results, overallStatus } = usePublishStore();
  const successCount = results.filter((result) => result.status === 'success').length;
  const errorCount = results.filter((result) => result.status === 'error').length;
  const inFlightCount = results.filter(
    (result) => result.status === 'publishing',
  ).length;
  const totalCount = results.length;

  if (overallStatus === 'idle') return null;

  return (
    <div className="mt-4 space-y-4 rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
            Case board
          </p>
          <h3
            className="mt-1 text-[18px] leading-tight text-[color:var(--wb-text)]"
            style={{ fontFamily: 'var(--wb-font-serif)' }}
          >
            发布回执跟踪板
          </h3>
        </div>

        <div className="flex flex-wrap gap-2 text-xs text-[color:var(--wb-text-muted)]">
          <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5">
            <CheckCircle2 size={12} className="text-[#2b9d62]" />
            {successCount} 已完成
          </span>
          <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5">
            <XCircle size={12} className="text-[#de6a6a]" />
            {errorCount} 异常
          </span>
          <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5">
            <Loader2 size={12} className={inFlightCount > 0 ? 'animate-spin text-[color:var(--wb-accent)]' : 'text-[color:var(--wb-text-muted)]'} />
            {totalCount > 0 ? `${totalCount} 张回执` : '等待回执'}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {results.length > 0
          ? results.map((result) => {
              const platform = PLATFORMS.find((p) => p.id === result.platform);
              if (!platform) return null;
              const Icon =
                iconMap[platform.icon as keyof typeof iconMap];

              return (
                <div
                  key={result.platform}
                  className={`grid gap-3 rounded-[var(--wb-radius-xl)] border px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center ${
                    result.status === 'success'
                      ? 'border-[#bfe8cb] bg-[#f4fbf6]'
                      : result.status === 'error'
                      ? 'border-[#f4c1c1] bg-[#fff4f4]'
                      : 'bg-[color:var(--wb-bg-elevated)] border-[color:var(--wb-border)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)]">
                      <Icon size={18} className="text-[color:var(--wb-text-muted)]" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-[color:var(--wb-text)]">
                        {platform.name}
                      </span>
                      <div className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-text-muted)]">
                        {result.status === 'success'
                          ? 'Completed case'
                          : result.status === 'error'
                          ? 'Needs attention'
                          : 'In flight'}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <span
                      className={`text-sm leading-6 ${
                        result.status === 'success'
                          ? 'text-[#247a4b]'
                          : result.status === 'error'
                          ? 'text-[#bf4b4b]'
                          : 'text-[color:var(--wb-text-muted)]'
                      }`}
                    >
                      {result.message}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-[var(--wb-radius-lg)] border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ${
                        result.status === 'success'
                          ? 'border-[#bfe8cb] bg-white text-[#247a4b]'
                          : result.status === 'error'
                          ? 'border-[#f4c1c1] bg-white text-[#bf4b4b]'
                          : 'border-[color:var(--wb-border)] bg-white text-[color:var(--wb-text-muted)]'
                      }`}
                    >
                      {result.status === 'success' && <CheckCircle2 size={12} />}
                      {result.status === 'error' && <XCircle size={12} />}
                      {result.status === 'publishing' && (
                        <Loader2 size={12} className="animate-spin" />
                      )}
                      {result.status}
                    </span>

                    {result.url ? (
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`打开 ${platform.name} 发布结果`}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] text-[color:var(--wb-accent)] transition hover:border-[color:var(--wb-border-strong)] hover:bg-[color:var(--wb-surface)]"
                      >
                        <ExternalLink size={15} />
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })
          : // Show loading placeholders during publishing
            overallStatus === 'publishing' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
                  <Loader2
                    size={18}
                    className="shrink-0 animate-spin text-[color:var(--wb-accent)]"
                  />
                  <span className="text-sm text-[color:var(--wb-text-muted)]">
                    正在向已选平台送达稿件...
                  </span>
                </div>
                <div className="rounded-[var(--wb-radius-xl)] border border-dashed border-[color:var(--wb-border-strong)] bg-[color:var(--wb-bg-elevated)] px-4 py-3 text-sm leading-6 text-[color:var(--wb-text-muted)]">
                  回执到达后，这里会自动变成每个平台的案例卡片。
                </div>
              </div>
            )}
      </div>
    </div>
  );
}
