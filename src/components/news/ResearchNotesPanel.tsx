'use client';
import { BookOpenText, Clock3, ListChecks, Target } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import type { ResearchBrief } from '@/lib/aiNews';

interface ResearchNotesPanelProps {
  research: ResearchBrief | null;
  generatedAt: string;
  signalCount: number;
  candidateCount: number;
  todayCount: number;
  followCount: number;
}

function formatDeskTime(value: string) {
  return value || '准备中';
}

export default function ResearchNotesPanel({
  research,
  generatedAt,
  signalCount,
  candidateCount,
  todayCount,
  followCount,
}: ResearchNotesPanelProps) {
  return (
    <aside className="self-start">
      <SurfaceCard tone="soft" className="sticky top-6 overflow-hidden px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.78)] text-[color:var(--wb-accent-strong)]">
            <BookOpenText size={18} />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
              Research Notes
            </p>
            <h2
              className="mt-1 text-[22px] leading-tight text-[color:var(--wb-ink)]"
              style={{ fontFamily: 'var(--wb-font-serif)' }}
            >
              稳定研究笔记桌
            </h2>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
              信号
            </p>
            <p className="mt-2 text-[16px] text-[color:var(--wb-ink)]">
              {signalCount} 条原始资讯
            </p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
              候选
            </p>
            <p className="mt-2 text-[16px] text-[color:var(--wb-ink)]">
              {candidateCount} 条题簇
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <Clock3 size={12} />
            更新时间
          </div>
          <p className="mt-2 text-[15px] leading-7 text-[color:var(--wb-ink)]">
            {formatDeskTime(generatedAt)}
          </p>
          <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
            今天能发 {todayCount} 条，还能追 {followCount} 条。右侧固定显示当前选中候选的研究底稿。
          </p>
        </div>

        <div className="mt-5 space-y-3">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
            <Target size={12} />
            Desk Notes
          </div>
          <div className="space-y-3">
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.78)] text-[11px] text-[color:var(--wb-accent-strong)]">
                  1
                </span>
                <p className="text-sm leading-7 text-[color:var(--wb-ink)]">
                    优先看标题、时间和来源，把最像商业媒体头条的信号放在前面。
                </p>
              </div>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.78)] text-[11px] text-[color:var(--wb-accent-strong)]">
                  2
                </span>
                <p className="text-sm leading-7 text-[color:var(--wb-ink)]">
                    右侧笔记保留主题结论，左侧卡片保留原文定位，方便继续扩写成稿。
                </p>
              </div>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.78)] text-[11px] text-[color:var(--wb-accent-strong)]">
                  3
                </span>
                <p className="text-sm leading-7 text-[color:var(--wb-ink)]">
                    如果要直接发稿，先生成长文草稿，再补一句判断和读者视角。
                    如果要进入写作台，优先带着底稿走，而不是直接抄摘要。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <ListChecks size={12} />
            研究底稿
          </div>

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

              <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  为什么重要
                </p>
                <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                  {research.whyItMatters}
                </p>
              </div>

              <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  影响了谁
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {research.whoIsAffected.map((audience) => (
                    <span
                      key={audience}
                      className="inline-flex rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.78)] px-3 py-1.5 text-xs text-[color:var(--wb-ink)]"
                    >
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
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

              <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
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

              <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-4">
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
    </aside>
  );
}
