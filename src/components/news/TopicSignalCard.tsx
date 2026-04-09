import { useState } from 'react';
import { Clock3, ExternalLink, FileUp, Landmark, ChevronDown } from 'lucide-react';

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

function MetaChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-3">
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
  onCreateDraft,
}: TopicSignalCardProps) {
  const [showBrief, setShowBrief] = useState(false);
  const brief = item.researchBrief;

  return (
    <SurfaceCard tone="default" className="overflow-hidden">
      <article className="px-5 py-5 sm:px-6">
        <div className="space-y-4">
          {/* 标签行 */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
            <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5 text-[color:var(--wb-accent-strong)]">
              <Landmark size={12} />
              {indexLabel}
            </span>
            <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5 text-[color:var(--wb-ink)]">
              {item.topicTags[0] || '行业动态'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5">
              {item.primarySignal.sourceName}
            </span>
            <span className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-3 py-1.5">
              <Clock3 size={12} />
              {relativeLabel}
            </span>
          </div>

          {/* 标题 + 元数据 */}
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

          {/* 编辑判断 + 候选概况 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                编辑判断
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                影响对象：{item.affectedSummary || '仍需补充核验'}。推荐切口：{item.angleSummary}。
              </p>
            </div>
            <div className="rounded-[var(--wb-radius-lg)] border border-dashed border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                候选概况
              </p>
              <div className="mt-2 space-y-1.5 text-sm leading-7 text-[color:var(--wb-muted)]">
                <p>
                  {item.coverageCount} 条相关报道，官方源 {item.officialSourceCount} 条，媒体源 {item.mediaSourceCount} 条。
                </p>
                <p>{formatArticleMetrics(item.primarySignal.articleWordCount, item.primarySignal.articleImageCount)}</p>
                <p>原文：{formatHostname(item.primarySignal.link)}</p>
              </div>
            </div>
          </div>

          {/* 操作按钮：查看原文 → 查看底稿 → 加入写作台 */}
          <div className="flex flex-wrap gap-2">
            <a
              href={item.primarySignal.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[color:var(--wb-surface)]"
            >
              <ExternalLink size={16} />
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
              <FileUp size={16} />
              加入写作台
            </button>
          </div>

          {/* 内联研究底稿 */}
          {showBrief && brief ? (
            <div className="space-y-3 border-t border-[color:var(--wb-border)] pt-4">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-muted)]">
                研究底稿
              </p>

              <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
                <p className="text-sm leading-7 text-[color:var(--wb-muted)]">
                  {brief.whatHappened}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                    为什么重要
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--wb-ink)]">
                    {brief.whyItMatters}
                  </p>
                </div>
                <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                    影响了谁
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {brief.whoIsAffected.map((audience) => (
                      <span
                        key={audience}
                        className="inline-flex rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] px-3 py-1 text-xs text-[color:var(--wb-ink)]"
                      >
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
                  推荐写法
                </p>
                <div className="mt-3 space-y-3">
                  {brief.recommendedAngles.map((angle) => (
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
            </div>
          ) : null}

          {/* 评分详情 */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[color:var(--wb-border)] pt-3 text-[13px] text-[color:var(--wb-muted)]">
            <span>新鲜度 {item.scores.freshness}</span>
            <span>影响 {item.scores.impact}</span>
            <span>势能 {item.scores.momentum}</span>
            <span>可信 {item.scores.credibility}</span>
            <span>配图完成度 {item.scores.visualReadiness}</span>
          </div>
        </div>
      </article>
    </SurfaceCard>
  );
}
