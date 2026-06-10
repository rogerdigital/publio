'use client';

import { AlertTriangle, ShieldAlert, X } from 'lucide-react';
import type { SensitiveMatch } from '@/lib/moderation/types';
import * as styles from './publish.css';

interface ModerationWarningProps {
  matches: SensitiveMatch[];
  onContinue: () => void;
  onCancel: () => void;
}

const categoryLabels: Record<string, string> = {
  political: '政治敏感',
  pornographic: '色情',
  violent: '暴力',
  advertising: '广告违规',
  general: '通用敏感',
};

export default function ModerationWarning({
  matches,
  onContinue,
  onCancel,
}: ModerationWarningProps) {
  const grouped = matches.reduce<Record<string, SensitiveMatch[]>>((acc, m) => {
    (acc[m.category] ??= []).push(m);
    return acc;
  }, {});

  return (
    <div className={styles.moderationOverlay} onClick={onCancel}>
      <div className={styles.moderationDialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.moderationHeader}>
          <ShieldAlert size={20} />
          <span>内容安全检查</span>
          <button
            type="button"
            className={styles.moderationClose}
            onClick={onCancel}
            aria-label="关闭"
          >
            <X size={16} />
          </button>
        </div>

        <div className={styles.moderationBody}>
          <p className={styles.moderationSummary}>
            检测到 <strong>{matches.length}</strong> 个敏感词：
          </p>

          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className={styles.moderationCategory}>
              <span className={styles.moderationCategoryLabel}>
                {categoryLabels[category] ?? category}
              </span>
              <div className={styles.moderationWords}>
                {items.map((item, i) => (
                  <span key={i} className={styles.moderationWord}>
                    {item.word}
                  </span>
                ))}
              </div>
            </div>
          ))}

          <p className={styles.moderationHint}>
            <AlertTriangle size={14} />
            继续发布可能导致内容被平台拦截或账号受限。
          </p>
        </div>

        <div className={styles.moderationActions}>
          <button type="button" className={styles.moderationCancelBtn} onClick={onCancel}>
            返回修改
          </button>
          <button type="button" className={styles.moderationContinueBtn} onClick={onContinue}>
            继续发布
          </button>
        </div>
      </div>
    </div>
  );
}
