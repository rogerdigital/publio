import { useState } from 'react';
import { Clock3, ExternalLink, FileUp, ChevronDown, CheckCircle2 } from 'lucide-react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import ScoreBar from '@/components/news/ScoreBar';
import type { AiNewsDeskCandidate } from '@/lib/aiNews';
import * as styles from './news.css';

interface TopicSignalCardProps {
  item: AiNewsDeskCandidate;
  indexLabel: string;
  relativeLabel: string;
  formattedDate: string;
  draftId?: string;
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
  draftId,
  onCreateDraft,
}: TopicSignalCardProps) {
  const [showBrief, setShowBrief] = useState(false);
  const brief = item.researchBrief;
  const metrics = formatArticleMetrics(
    item.primarySignal.articleWordCount,
    item.primarySignal.articleImageCount,
  );

  return (
    <SurfaceCard tone="default" className={styles.card}>
      <article className={styles.cardInner}>
        <div>

          {/* 顶部元信息行 */}
          <div className={styles.metaRow}>
            <div className={styles.metaLeft}>
              {/* 序号 */}
              <span className={styles.indexBadge}>
                {indexLabel}
              </span>
              <span className={styles.topicTag}>
                {item.topicTags[0] || '行业动态'}
              </span>
              <span className={styles.metaDot}>·</span>
              <a
                href={new URL(item.primarySignal.link).origin}
                target="_blank"
                rel="noreferrer"
                className={styles.sourceLink}
              >
                {item.primarySignal.sourceName}
              </a>
              <span className={styles.metaDot}>·</span>
              <span className={styles.timeLabel}>
                <Clock3 size={12} />
                {relativeLabel}
              </span>
            </div>
            {/* 字数/配图 — 右上角 */}
            {metrics && (
              <span className={styles.metricsLabel}>
                {metrics}
              </span>
            )}
          </div>

          {/* 标题 */}
          <div className={styles.headlineBlock}>
            <h3 className={styles.headline}>
              {item.title}
            </h3>
            <p className={styles.whyNow}>
              {item.whyNow}
            </p>
          </div>

          {/* 编辑判断 — 左侧竖线，无内框 */}
          <div className={styles.editorialBar}>
            <p className={styles.editorialKicker}>
              编辑判断
            </p>
            <p className={styles.editorialText}>
              {item.affectedSummary
                ? `影响对象：${item.affectedSummary}。`
                : ''}
              推荐切口：{item.angleSummary}。
            </p>
          </div>

          {/* 操作按钮 */}
          <div className={styles.actionsRow}>
            {/* 评分区 — 六条进度条 + 总分，桌面端显示 */}
            <div className={styles.scoreBarsBlock}>
              <div className={styles.scoreBarsGrid}>
                <ScoreBar label="新鲜度" value={item.scores.freshness} />
                <ScoreBar label="影响力" value={item.scores.impact} />
                <ScoreBar label="势　能" value={item.scores.momentum} />
                <ScoreBar label="可信度" value={item.scores.credibility} />
                <ScoreBar label="视觉力" value={item.scores.visualReadiness} />
                <ScoreBar label="创作适" value={item.scores.creatorFit} />
              </div>
              <span className={styles.scoreHighlight} style={{ alignSelf: 'flex-end', flexShrink: 0 }}>
                {item.totalScore.toFixed(0)} 分
              </span>
            </div>
            <a
              href={item.primarySignal.link}
              target="_blank"
              rel="noreferrer"
              className={styles.actionButton({ variant: 'secondary' })}
            >
              <ExternalLink size={15} />
              查看原文
            </a>
            <button
              type="button"
              onClick={() => setShowBrief((v) => !v)}
              className={styles.actionButton({ variant: 'secondary' })}
            >
              <ChevronDown
                size={15}
                style={{
                  transition: 'transform 200ms',
                  transform: showBrief ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
              {showBrief ? '收起底稿' : '查看底稿'}
            </button>
            {draftId ? (
              <a
                href={`/?draftId=${draftId}`}
                className={styles.actionButton({ variant: 'added' })}
              >
                <CheckCircle2 size={15} />
                已加入写作台
              </a>
            ) : (
              <button
                type="button"
                onClick={() => onCreateDraft(item)}
                className={styles.actionButton({ variant: 'primary' })}
              >
                <FileUp size={15} />
                加入写作台
              </button>
            )}
          </div>

          {/* 内联研究底稿 */}
          {showBrief && brief ? (
            <div className={styles.briefSection}>
              <div className={styles.briefBlock}>
                <p className={styles.briefKicker}>事件经过</p>
                <p className={styles.briefText}>
                  {brief.whatHappened}
                </p>
              </div>

              <div className={styles.briefBlockAccent}>
                <p className={styles.briefKickerAccent}>为什么重要</p>
                <p className={styles.briefTextDark}>
                  {brief.whyItMatters}
                </p>
              </div>

              <div className={styles.briefBlockPlain}>
                <p className={styles.briefKicker}>影响了谁</p>
                <p className={styles.affectedList}>
                  {brief.whoIsAffected.join(' · ')}
                </p>
              </div>

              <div className={styles.briefBlockPlain}>
                <p className={styles.briefKicker}>推荐写法</p>
                <div className={styles.angleList}>
                  {brief.recommendedAngles.map((angle) => (
                    <div key={angle.label}>
                      <p className={styles.angleLabel}>{angle.label}</p>
                      <p className={styles.angleReason}>{angle.reason}</p>
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
