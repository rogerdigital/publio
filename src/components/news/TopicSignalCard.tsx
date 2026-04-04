import { Clock3, ExternalLink, FileUp, Landmark } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';

export interface TopicSignalItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  score: number;
  topic: string;
  emoji: string;
  deck: string;
  body: string;
  takeaway: string;
  imageUrl?: string;
}

interface TopicSignalCardProps {
  item: TopicSignalItem;
  indexLabel: string;
  relativeLabel: string;
  formattedDate: string;
  onCreateDraft: (item: TopicSignalItem) => void;
}

function scoreLabel(score: number) {
  if (score >= 75) {
    return '强信号';
  }

  if (score >= 50) {
    return '中信号';
  }

  return '待核验';
}

function formatHostname(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return '来源链接待核验';
  }
}

export default function TopicSignalCard({
  item,
  indexLabel,
  relativeLabel,
  formattedDate,
  onCreateDraft,
}: TopicSignalCardProps) {
  return (
    <SurfaceCard tone="accent" className="overflow-hidden">
      <article className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-[color:var(--wb-accent-strong)]">
              <Landmark size={12} />
              {indexLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5 text-[color:var(--wb-ink)]">
              {item.topic}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5">
              {item.source}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.74)] px-3 py-1.5">
              <Clock3 size={12} />
              {relativeLabel}
            </span>
          </div>

          <h3
            className="mt-4 text-[24px] leading-[1.35] text-[color:var(--wb-ink)] sm:text-[28px]"
            style={{ fontFamily: 'var(--wb-font-serif)' }}
          >
            <span className="mr-2 align-middle text-[28px]">{item.emoji}</span>
            {item.title}
          </h3>

          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[color:var(--wb-muted)]">
            {item.deck}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-accent)]">
                信号摘记
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                {item.body}
              </p>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.72)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-accent)]">
                编辑判断
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                {item.takeaway}
              </p>
            </div>
          </div>

          {item.summary ? (
            <div className="mt-5 rounded-[22px] border border-dashed border-[color:var(--wb-border-strong)] bg-[rgba(255,255,255,0.44)] px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                原文摘要
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
                {item.summary}
              </p>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onCreateDraft(item)}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[rgba(255,255,255,0.8)] px-4 py-2 text-sm font-medium text-[color:var(--wb-accent-strong)] transition hover:bg-[rgba(255,255,255,0.98)]"
            >
              <FileUp size={16} />
              转成长文稿
            </button>
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[rgba(255,255,255,0.96)]"
            >
              <ExternalLink size={16} />
              查看原文
            </a>
          </div>
        </div>

        <div className="border-t border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.42)] p-5 sm:p-6 lg:border-l lg:border-t-0">
          {item.imageUrl ? (
            <div
              className="overflow-hidden rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.84)]"
              role="img"
              aria-label={item.title}
            >
              <div
                className="h-[180px] w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${item.imageUrl})` }}
              />
            </div>
          ) : (
            <div className="rounded-[24px] border border-[color:var(--wb-border)] bg-[linear-gradient(180deg,rgba(255,252,247,0.9)_0%,rgba(245,232,220,0.88)_100%)] p-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--wb-muted)]">
                Signal Index
              </p>
              <p className="mt-3 text-[44px] leading-none text-[color:var(--wb-accent-strong)]">
                {indexLabel}
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--wb-ink)]">
                {scoreLabel(item.score)}
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--wb-muted)]">
            <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                发布时间
              </p>
              <p className="mt-1 text-[15px] text-[color:var(--wb-ink)]">{formattedDate}</p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                评分
              </p>
              <p className="mt-1 text-[15px] text-[color:var(--wb-ink)]">
                {item.score.toFixed(0)} / 100
              </p>
            </div>
            <div className="rounded-[20px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                原文定位
              </p>
              <p className="mt-1 break-all text-[13px] leading-6 text-[color:var(--wb-ink)]">
                {formatHostname(item.link)}
              </p>
            </div>
          </div>
        </div>
      </article>
    </SurfaceCard>
  );
}
