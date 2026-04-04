'use client';

import { useState } from 'react';

import { BookOpenText, Clock3, ListChecks, Target } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';

interface ResearchNoteBrief {
  title: string;
  summary: string;
}

interface ResearchNotesPanelProps {
  briefs: ResearchNoteBrief[];
  generatedAt: string;
  itemCount: number;
  briefCount: number;
  windowHours: number;
}

function formatDeskTime(value: string) {
  return value || '准备中';
}

export default function ResearchNotesPanel({
  briefs,
  generatedAt,
  itemCount,
  briefCount,
  windowHours,
}: ResearchNotesPanelProps) {
  const [showAllBriefs, setShowAllBriefs] = useState(false);
  const visibleBriefs = showAllBriefs ? briefs : briefs.slice(0, 4);
  const hasMoreBriefs = briefs.length > 4;

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
              窗口
            </p>
            <p className="mt-2 text-[16px] text-[color:var(--wb-ink)]">
              最近 {windowHours} 小时
            </p>
          </div>
          <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
              信号
            </p>
            <p className="mt-2 text-[16px] text-[color:var(--wb-ink)]">
              {itemCount} 条候选
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
            {briefCount > 0
              ? `本轮已整理出 ${briefCount} 条研究提要，适合从标题进入更深的编辑判断。`
              : '本轮暂未形成研究提要，先以候选列表和原文为准。'}
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
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.66)] p-4">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <ListChecks size={12} />
            提要索引
          </div>

          {briefs.length > 0 ? (
            <div className="mt-4 space-y-4">
              {visibleBriefs.map((brief, index) => (
                <div key={`${brief.title}-${index}`} className="border-l-2 border-[color:var(--wb-accent)] pl-4">
                  <p className="text-sm font-medium leading-6 text-[color:var(--wb-ink)]">
                    {brief.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                    {brief.summary}
                  </p>
                </div>
              ))}
              {hasMoreBriefs ? (
                <button
                  type="button"
                  onClick={() => setShowAllBriefs((value) => !value)}
                  aria-expanded={showAllBriefs}
                  className="inline-flex items-center rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.68)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[rgba(255,255,255,0.95)]"
                >
                  {showAllBriefs
                    ? '收起提要'
                    : `显示全部 ${briefs.length} 条提要`}
                </button>
              ) : null}
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[color:var(--wb-muted)]">
              暂无提要，先基于候选卡片直接判断主题方向。
            </p>
          )}
        </div>
      </SurfaceCard>
    </aside>
  );
}
