import { Clock3, ExternalLink, FileUp, Landmark } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import type { AiNewsDeskCandidate } from '@/lib/aiNews';

interface TopicSignalCardProps {
  item: AiNewsDeskCandidate;
  indexLabel: string;
  relativeLabel: string;
  formattedDate: string;
  isActive: boolean;
  onSelect: (item: AiNewsDeskCandidate) => void;
  onCreateDraft: (item: AiNewsDeskCandidate) => void;
}

function formatHostname(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return '来源链接待核验';
  }
}

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--wb-muted)]">
        {label}
      </p>
      <p className="mt-1 text-[14px] leading-6 text-[color:var(--wb-ink)]">
        {value}
      </p>
    </div>
  );
}

function formatArticleMetrics(wordCount?: number, imageCount?: number) {
  const parts: string[] = [];

  if (typeof wordCount === 'number' && wordCount > 0) {
    parts.push(`原文约 ${wordCount.toLocaleString('zh-CN')} 字`);
  }

  if (typeof imageCount === 'number' && imageCount >= 0) {
    parts.push(`配图 ${imageCount} 张`);
  }

  return parts.join('，') || '原文字数与配图数量待补充';
}

export default function TopicSignalCard({
  item,
  indexLabel,
  relativeLabel,
  formattedDate,
  isActive,
  onSelect,
  onCreateDraft,
}: TopicSignalCardProps) {
  return (
    <SurfaceCard
      tone="accent"
      className={`overflow-hidden transition ${
        isActive
          ? 'ring-2 ring-[color:var(--wb-accent)] shadow-[0_14px_28px_rgba(200,106,61,0.12)]'
          : ''
      }`}
    >
      <article className="px-5 py-5 sm:px-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-[color:var(--wb-accent-strong)]">
              <Landmark size={12} />
              {indexLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-[color:var(--wb-ink)]">
              {item.topicTags[0] || '行业动态'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5">
              {item.primarySignal.sourceName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5">
              <Clock3 size={12} />
              {relativeLabel}
            </span>
            {isActive ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[rgba(255,247,240,0.94)] px-3 py-1.5 text-[color:var(--wb-accent-strong)]">
                当前查看中
              </span>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-4xl">
              <h3
                className="text-[20px] leading-[1.4] text-[color:var(--wb-ink)] sm:text-[24px]"
                style={{ fontFamily: 'var(--wb-font-serif)' }}
              >
                {item.title}
              </h3>
              <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[color:var(--wb-muted)]">
                {item.whyNow}
              </p>
            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2 lg:min-w-[16rem]">
              <MetaChip label="综合评分" value={`${item.totalScore.toFixed(0)} / 100`} />
              <MetaChip label="发布时间" value={formattedDate} />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)_auto] lg:items-start">
            <div className="rounded-[18px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                编辑判断
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                影响对象：{item.affectedSummary || '仍需补充核验'}。推荐切口：{item.angleSummary}。
              </p>
            </div>

            <div className="rounded-[18px] border border-dashed border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.44)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                候选概况
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                {item.coverageCount} 条相关报道，官方源 {item.officialSourceCount} 条，媒体源 {item.mediaSourceCount} 条。
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                {formatArticleMetrics(
                  item.primarySignal.articleWordCount,
                  item.primarySignal.articleImageCount,
                )}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                原文：{formatHostname(item.primarySignal.link)}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                type="button"
                onClick={() => onSelect(item)}
                aria-pressed={isActive}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'border-[color:var(--wb-border-strong)] bg-[rgba(255,247,240,0.94)] text-[color:var(--wb-accent-strong)]'
                    : 'border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] text-[color:var(--wb-ink)] hover:bg-[rgba(255,255,255,0.96)]'
                }`}
              >
                {isActive ? '当前底稿' : '查看底稿'}
              </button>
              <button
                type="button"
                onClick={() => onCreateDraft(item)}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm font-medium text-[color:var(--wb-accent-strong)] transition hover:bg-[rgba(255,255,255,0.98)]"
              >
                <FileUp size={16} />
                加入写作台
              </button>
              <a
                href={item.primarySignal.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[rgba(255,255,255,0.96)]"
              >
                <ExternalLink size={16} />
                查看原文
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--wb-border)] pt-3 text-[13px] text-[color:var(--wb-muted)]">
            <span>新鲜度 {item.scores.freshness}</span>
            <span>影响 {item.scores.impact}</span>
            <span>势能 {item.scores.momentum}</span>
            <span>可信 {item.scores.credibility}</span>
          </div>
        </div>
      </article>
    </SurfaceCard>
  );
}
