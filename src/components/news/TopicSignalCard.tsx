import { useState } from 'react';
import { Clock3, ExternalLink, FileUp, ChevronDown } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import type { AiNewsDeskCandidate } from '@/lib/aiNews';

interface TopicSignalCardProps {
  item: AiNewsDeskCandidate;
  indexLabel: string;
  relativeLabel: string;
  formattedDate: string;
  onCreateDraft: (item: AiNewsDeskCandidate) => void;
}

function formatHostname(link: string) {
  try {
    return new URL(link).hostname;
  } catch {
    return '来源链接待核验';
  }
}

function formatArticleMetrics(wordCount?: number, imageCount?: number) {
  const parts: string[] = [];
  if (typeof wordCount === 'number' && wordCount > 0) {
    parts.push(`约 ${wordCount.toLocaleString('zh-CN')} 字`);
  }
  if (typeof imageCount === 'number' && imageCount >= 0) {
    parts.push(`配图 ${imageCount} 张`);
  }
  return parts.join(' · ') || null;
}

export default function TopicSignalCard({
  item,
  indexLabel,
  relativeLabel,
  formattedDate,
  onCreateDraft,
}: TopicSignalCardProps) {
  const [showBrief, setShowBrief] = useState(false);
  const brief = item.researchBrief;
  const metrics = formatArticleMetrics(
    item.primarySignal.articleWordCount,
    item.primarySignal.articleImageCount,
  );

  return (
    <SurfaceCard tone="default" className="overflow-hidden">
      <article className="px-5 py-5 sm:px-6">
        <div className="space-y-4">

          {/* 顶部元信息行 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {/* 序号 — 保留 chip 作为视觉锚点 */}
            <span className="inline-flex items-center gap-1.5 rounded-[var(--wb-radius-lg)] bg-[color:var(--wb-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--wb-accent-strong)]">
              {indexLabel}
            </span>
            {/* 话题标签、来源、时间 — 纯文字，用间隔符分开 */}
            <span className="text-[13px] font-medium text-[color:var(--wb-ink)]">
              {item.topicTags[0] || '行业动态'}
            </span>
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span className="text-[13px] text-[color:var(--wb-muted)]">
              {item.primarySignal.sourceName}
            </span>
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span className="inline-flex items-center gap-1 text-[13px] text-[color:var(--wb-muted)]">
              <Clock3 size={12} />
              {relativeLabel}
            </span>
          </div>

          {/* 标题 + 评分/时间（无框，纯文字） */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="min-w-0">
              <h3
                className="text-[20px] font-semibold leading-[1.4] text-[color:var(--wb-ink)] sm:text-[22px]"
                style={{ fontFamily: 'var(--wb-font-serif)' }}
              >
                {item.title}
              </h3>
              <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[color:var(--wb-muted)]">
                {item.whyNow}
              </p>
            </div>
            <div className="flex shrink-0 gap-5 sm:flex-col sm:items-end sm:gap-1 sm:pt-1">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--wb-muted)]">综合评分</p>
                <p className="mt-0.5 text-[22px] font-semibold leading-none text-[color:var(--wb-accent)]">
                  {item.totalScore.toFixed(0)}
                  <span className="ml-1 text-[13px] font-normal text-[color:var(--wb-muted)]">/ 100</span>
                </p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--wb-muted)]">发布时间</p>
                <p className="mt-0.5 text-[13px] text-[color:var(--wb-ink)]">{formattedDate}</p>
              </div>
            </div>
          </div>

          {/* 编辑判断 — 左侧竖线，无内框 */}
          <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
              编辑判断
            </p>
            <p className="mt-1.5 text-[14px] leading-7 text-[color:var(--wb-ink)]">
              {item.affectedSummary
                ? `影响对象：${item.affectedSummary}。`
                : ''}
              推荐切口：{item.angleSummary}。
            </p>
          </div>

          {/* 候选概况 — 单行内联，无内框 */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[color:var(--wb-muted)]">
            <span>{item.coverageCount} 条报道</span>
            {item.officialSourceCount > 0 && (
              <>
                <span className="text-[color:var(--wb-border-strong)]">·</span>
                <span>官方源 {item.officialSourceCount}</span>
              </>
            )}
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <span>媒体源 {item.mediaSourceCount}</span>
            {metrics && (
              <>
                <span className="text-[color:var(--wb-border-strong)]">·</span>
                <span>{metrics}</span>
              </>
            )}
            <span className="text-[color:var(--wb-border-strong)]">·</span>
            <a
              href={item.primarySignal.link}
              target="_blank"
              rel="noreferrer"
              className="text-[color:var(--wb-muted)] underline decoration-[color:var(--wb-border-strong)] underline-offset-4 hover:text-[color:var(--wb-accent)]"
            >
              {formatHostname(item.primarySignal.link)}
            </a>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--wb-border)] pt-3">
            {/* 评分维度 — 左侧 */}
            <span className="mr-auto hidden items-center gap-3 text-[12px] text-[color:var(--wb-muted)] sm:flex">
              <span>新鲜度 {item.scores.freshness}</span>
              <span>影响力 {item.scores.impact}</span>
              <span>势能 {item.scores.momentum}</span>
              <span>可信度 {item.scores.credibility}</span>
            </span>
            <a
              href={item.primarySignal.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[color:var(--wb-surface)]"
            >
              <ExternalLink size={15} />
              查看原文
            </a>
            <button
              type="button"
              onClick={() => setShowBrief((v) => !v)}
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[color:var(--wb-surface)]"
            >
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${showBrief ? 'rotate-180' : ''}`}
              />
              {showBrief ? '收起底稿' : '查看底稿'}
            </button>
            <button
              type="button"
              onClick={() => onCreateDraft(item)}
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-transparent bg-[color:var(--wb-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105"
            >
              <FileUp size={15} />
              加入写作台
            </button>
          </div>

          {/* 内联研究底稿 */}
          {showBrief && brief ? (
            <div className="space-y-4 border-t border-[color:var(--wb-border)] pt-4">
              <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">事件经过</p>
                <p className="mt-1.5 text-sm leading-7 text-[color:var(--wb-muted)]">
                  {brief.whatHappened}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">为什么重要</p>
                  <p className="mt-1.5 text-sm leading-7 text-[color:var(--wb-ink)]">
                    {brief.whyItMatters}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">影响了谁</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {brief.whoIsAffected.map((audience) => (
                      <span
                        key={audience}
                        className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-2.5 py-1 text-xs text-[color:var(--wb-ink)]"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">推荐写法</p>
                <div className="mt-2 space-y-3">
                  {brief.recommendedAngles.map((angle) => (
                    <div key={angle.label}>
                      <p className="text-sm font-medium leading-6 text-[color:var(--wb-ink)]">{angle.label}</p>
                      <p className="text-sm leading-7 text-[color:var(--wb-muted)]">{angle.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </article>
    </SurfaceCard>
  );
}
