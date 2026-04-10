'use client';

import { usePublishStore } from '@/stores/publishStore';
import SurfaceCard from '@/components/layout/SurfaceCard';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
} from '@/lib/contentStats';
import * as styles from './editor.css';

interface StatPillProps {
  label: string;
  value: string;
}

function StatPill({ label, value }: StatPillProps) {
  return (
    <div className={styles.statPill}>
      <div className={styles.statPillLabel}>{label}</div>
      <div className={styles.statPillValue}>{value}</div>
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
    <SurfaceCard tone="accent" className={styles.contextCard}>
      <div className={styles.contextInner}>
        <div className={styles.contextHeader}>
          <div className={styles.contextHeaderText}>
            <p className={styles.contextKicker}>
              Editorial context
            </p>
            <p className={styles.contextDesc}>
              这里保留最必要的结构信号，帮助你判断稿件是否已经进入可发布状态。
            </p>
          </div>

          <div className={styles.contextBadges}>
            <span className={styles.contextBadgeNeutral}>
              {cleanTitle ? '标题已写入' : '标题待补全'}
            </span>
            <span className={styles.contextBadgeAccent}>
              Research-aware
            </span>
          </div>
        </div>

        {cleanTitle ? (
          <div className={styles.titleBlock}>
            <div className={styles.titleBlockLabel}>当前标题</div>
            <div className={styles.titleBlockValue}>
              {cleanTitle}
            </div>
          </div>
        ) : (
          <div className={styles.titleBlockEmpty}>
            先补一个明确标题，后续的结构判断、导语节奏和发布预览会更容易对齐。
          </div>
        )}

        <div className={styles.statsGrid}>
          <StatPill label="字符" value={characters ? `${characters}` : '0'} />
          <StatPill label="段落" value={paragraphs ? `${paragraphs}` : '0'} />
          <StatPill label="标题层级" value={headings ? `${headings}` : '0'} />
          <StatPill label="预计阅读" value={cleanContent ? readTime : '1 分钟'} />
        </div>

        <p className={styles.contextFooter}>
          {cleanContent
            ? '建议优先检查事实来源、时间线和关键术语，再把内容推向平台分发。'
            : '内容尚未开始输入时，这里会保持轻量提示，不打断写作节奏。'}
        </p>
      </div>
    </SurfaceCard>
  );
}
