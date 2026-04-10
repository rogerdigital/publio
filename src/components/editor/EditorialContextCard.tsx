'use client';

import { usePublishStore } from '@/stores/publishStore';
import SurfaceCard from '@/components/layout/SurfaceCard';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
} from '@/lib/contentStats';

interface StatPillProps {
  label: string;
  value: string;
}

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className="rounded-[16px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.82)] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--wb-text-muted)]">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-[color:var(--wb-text)]">
        {value}
      </div>
    </div>
  );
}

export default function EditorialContextCard() {
  const { title, content } = usePublishStore();

  const cleanTitle = title.trim();
  const cleanContent = content.trim();
  const characters = countCharacters(cleanContent);
  const paragraphs = countParagraphs(cleanContent);
  const headings = countHeadings(cleanContent);
  const readTime = estimateReadTime(cleanContent);

  return (
    <SurfaceCard tone="accent" className="px-4 py-3 sm:px-5">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
              Editorial context
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--wb-text-muted)]">
              这里保留最必要的结构信号，帮助你判断稿件是否已经进入可发布状态。
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1 text-xs text-[color:var(--wb-text-muted)]">
              {cleanTitle ? '标题已写入' : '标题待补全'}
            </span>
            <span className="rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,246,237,0.92)] px-3 py-1 text-xs text-[color:var(--wb-accent)]">
              Research-aware
            </span>
          </div>
        </div>

        {cleanTitle ? (
          <div className="rounded-[18px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.86)] px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--wb-text-muted)]">
              当前标题
            </div>
            <div
              className="font-serif-brand mt-2 text-[16px] leading-snug text-[color:var(--wb-text)]"
            >
              {cleanTitle}
            </div>
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-[color:var(--wb-border-strong)] bg-[rgba(255,252,247,0.68)] px-4 py-3 text-sm leading-7 text-[color:var(--wb-text-muted)]">
            先补一个明确标题，后续的结构判断、导语节奏和发布预览会更容易对齐。
          </div>
        )}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatPill label="字符" value={characters ? `${characters}` : '0'} />
          <StatPill label="段落" value={paragraphs ? `${paragraphs}` : '0'} />
          <StatPill label="标题层级" value={headings ? `${headings}` : '0'} />
          <StatPill label="预计阅读" value={cleanContent ? readTime : '1 分钟'} />
        </div>

        <p className="text-xs leading-6 text-[color:var(--wb-text-muted)]">
          {cleanContent
            ? '建议优先检查事实来源、时间线和关键术语，再把内容推向平台分发。'
            : '内容尚未开始输入时，这里会保持轻量提示，不打断写作节奏。'}
        </p>
      </div>
    </SurfaceCard>
  );
}
