'use client';
import { Clock3 } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import type { ResearchBrief } from '@/lib/aiNews';

interface ResearchNotesPanelProps {
  research: ResearchBrief | null;
  generatedAt: string;
  signalCount: number;
  candidateCount: number;
  todayCount: number;
  followCount: number;
  selectedTitle?: string;
}

function formatDeskTime(value: string) {
  return value || '准备中';
}

export default function ResearchNotesPanel({
  research,
  generatedAt,
  todayCount,
  followCount,
  selectedTitle,
}: ResearchNotesPanelProps) {
  return (
    <section id="research-brief-panel">
      <SurfaceCard tone="soft" className="overflow-hidden px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--wb-muted)]">
          <div className="inline-flex items-center gap-2">
            <Clock3 size={12} />
            <span>{formatDeskTime(generatedAt)}</span>
            <span className="mx-1 h-3 w-px bg-[color:var(--wb-border)]" />
            <span>今天能发 {todayCount} 条，还能追 {followCount} 条</span>
          </div>
          {selectedTitle ? (
            <div className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border-strong)] bg-[color:var(--wb-accent-soft)] px-3 py-1.5 text-xs text-[color:var(--wb-accent-strong)]">
              当前查看：{selectedTitle}
            </div>
          ) : null}
        </div>

        <div className="mt-5 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg)] p-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            研究底稿
          </p>

          {research ? (
            <div className="mt-4 space-y-4">
              <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
                <p className="text-sm font-medium leading-6 text-[color:var(--wb-ink)]">
                  {research.title}
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                  {research.whatHappened}
                </p>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  为什么重要
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                  {research.whyItMatters}
                </p>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  影响了谁
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {research.whoIsAffected.map((audience) => (
                    <span
                      key={audience}
                      className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5 text-xs text-[color:var(--wb-ink)]"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  推荐写法
                </p>
                <div className="mt-3 space-y-3">
                  {research.recommendedAngles.map((angle) => (
                    <div key={angle.label}>
                      <p className="text-sm font-medium leading-6 text-[color:var(--wb-ink)]">
                        {angle.label}
                      </p>
                      <p className="text-sm leading-7 text-[color:var(--wb-muted)]">
                        {angle.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  延展背景
                </p>
                <div className="mt-3 space-y-2">
                  {research.background.map((entry) => (
                    <p key={entry} className="text-sm leading-7 text-[color:var(--wb-muted)]">
                      {entry}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  原始依据
                </p>
                <div className="mt-3 space-y-3">
                  {research.evidence.map((entry) => (
                    <div key={entry.link}>
                      <p className="text-sm font-medium leading-6 text-[color:var(--wb-ink)]">
                        {entry.label}
                      </p>
                      <a
                        href={entry.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm leading-7 text-[color:var(--wb-muted)] underline decoration-[rgba(120,91,66,0.32)] underline-offset-4"
                      >
                        {entry.link}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[color:var(--wb-muted)]">
              暂无底稿，先基于候选卡片直接判断主题方向。
            </p>
          )}
        </div>
      </SurfaceCard>
    </section>
  );
}
