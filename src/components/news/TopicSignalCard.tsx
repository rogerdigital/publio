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
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              {/* 序号 */}
              <span className="inline-flex items-center gap-1.5 rounded-[var(--wb-radius-lg)] bg-[color:var(--wb-accent-soft)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--wb-accent-strong)]">
                {indexLabel}
              </span>
              <span className="text-[13px] font-medium text-[color:var(--wb-text)]">
                {item.topicTags[0] || '行业动态'}
              </span>
              <span className="text-[color:var(--wb-border-strong)]">·</span>
              <a
                href={new URL(item.primarySignal.link).origin}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-[color:var(--wb-text-muted)] transition hover:text-[color:var(--wb-accent)]"
              >
                {item.primarySignal.sourceName}
              </a>
              <span className="text-[color:var(--wb-border-strong)]">·</span>
              <span className="inline-flex items-center gap-1 text-[13px] text-[color:var(--wb-text-muted)]">
                <Clock3 size={12} />
                {relativeLabel}
              </span>
            </div>
            {/* 字数/配图 — 右上角 */}
            {metrics && (
              <span className="hidden shrink-0 text-[12px] text-[color:var(--wb-text-muted)] sm:block">
                {metrics}
              </span>
            )}
          </div>

          {/* 标题 */}
          <div className="min-w-0">
            <h3
              className="font-serif-brand text-[20px] font-semibold leading-[1.4] text-[color:var(--wb-text)] sm:text-[22px]"
            >
              {item.title}
            </h3>
            <p className="mt-2 max-w-3xl text-[15px] leading-7 text-[color:var(--wb-text-muted)]">
              {item.whyNow}
            </p>
          </div>

          {/* 编辑判断 — 左侧竖线，无内框 */}
          <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">
              编辑判断
            </p>
            <p className="mt-1.5 text-[14px] leading-7 text-[color:var(--wb-text)]">
              {item.affectedSummary
                ? `影响对象：${item.affectedSummary}。`
                : ''}
              推荐切口：{item.angleSummary}。
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap items-center gap-2 border-t border-[color:var(--wb-border-faint)] pt-3">
            {/* 评分区 — 底部左侧 */}
            <div className="mr-auto hidden items-center gap-3 text-[12px] text-[color:var(--wb-text-muted)] sm:flex">
              <span className="font-semibold text-[color:var(--wb-accent)]">
                {item.totalScore.toFixed(0)} 分
              </span>
              <span className="text-[color:var(--wb-border-strong)]">·</span>
              <span>新鲜度 {item.scores.freshness}</span>
              <span>影响力 {item.scores.impact}</span>
              <span>势能 {item.scores.momentum}</span>
              <span>可信度 {item.scores.credibility}</span>
            </div>
            <a
              href={item.primarySignal.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--wb-text)] transition hover:bg-[color:var(--wb-surface)]"
            >
              <ExternalLink size={15} />
              查看原文
            </a>
            <button
              type="button"
              onClick={() => setShowBrief((v) => !v)}
              className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-4 py-2 text-sm font-medium text-[color:var(--wb-text)] transition hover:bg-[color:var(--wb-surface)]"
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
            <div className="space-y-5 border-t border-[color:var(--wb-border-faint)] pt-5">
              <div className="border-l-2 border-[color:var(--wb-border-strong)] pl-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-text-muted)]">事件经过</p>
                <p className="mt-1.5 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                  {brief.whatHappened}
                </p>
              </div>

              <div className="border-l-2 border-[color:var(--wb-accent)] pl-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-accent)]">为什么重要</p>
                <p className="mt-1.5 text-sm leading-7 text-[color:var(--wb-text)]">
                  {brief.whyItMatters}
                </p>
              </div>

              <div className="pl-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-text-muted)]">影响了谁</p>
                <p className="mt-2 text-sm text-[color:var(--wb-text)]">
                  {brief.whoIsAffected.join(' · ')}
                </p>
              </div>

              <div className="pl-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--wb-text-muted)]">推荐写法</p>
                <div className="mt-2 space-y-3">
                  {brief.recommendedAngles.map((angle) => (
                    <div key={angle.label}>
                      <p className="text-sm font-medium leading-6 text-[color:var(--wb-text)]">{angle.label}</p>
                      <p className="text-sm leading-7 text-[color:var(--wb-text-muted)]">{angle.reason}</p>
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
