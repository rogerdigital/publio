'use client';

import { usePublishStore } from '@/stores/publishStore';
import {
  countCharacters,
  countParagraphs,
  countHeadings,
  estimateReadTime,
} from '@/lib/contentStats';
import * as publishStyles from '@/components/publish/publish.css';
import * as styles from './editor.css';

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.statPill}>
      <div className={styles.statPillLabel}>{label}</div>
      <div className={styles.statPillValue}>{value}</div>
    </div>
  );
}

export default function EditorialContextCard() {
  const { content } = usePublishStore();

  const cleanContent = content.trim();
  const characters = countCharacters(cleanContent);
  const paragraphs = countParagraphs(cleanContent);
  const headings = countHeadings(cleanContent);
  const readTime = estimateReadTime(cleanContent);

  return (
    <div className={publishStyles.rightPanelSection}>
      <span className={publishStyles.rightPanelSectionTitle}>内容统计</span>
      <div className={styles.statsGrid}>
        <StatPill label="字符" value={characters ? `${characters}` : '0'} />
        <StatPill label="段落" value={paragraphs ? `${paragraphs}` : '0'} />
        <StatPill label="标题层级" value={headings ? `${headings}` : '0'} />
        <StatPill label="阅读时长" value={cleanContent ? readTime : '—'} />
      </div>
    </div>
  );
}
