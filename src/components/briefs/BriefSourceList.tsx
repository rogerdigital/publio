'use client';

import { ExternalLink, X } from 'lucide-react';
import type { BriefSourceLink } from '@/lib/briefs/types';
import * as styles from './BriefEditor.css';

interface BriefSourceListProps {
  sources: BriefSourceLink[];
  onChange: (sources: BriefSourceLink[]) => void;
}

export default function BriefSourceList({ sources, onChange }: BriefSourceListProps) {
  const handleRemove = (index: number) => {
    onChange(sources.filter((_, i) => i !== index));
  };

  if (sources.length === 0) {
    return null;
  }

  return (
    <div className={styles.section}>
      <span className={styles.sectionLabel}>来源链接</span>
      <div className={styles.sourceList}>
        {sources.map((source, index) => (
          <div key={index} className={styles.sourceItem}>
            <span className={styles.sourceTitle}>{source.title || source.url}</span>
            {source.url && (
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.sourceLink}
              >
                <ExternalLink size={12} />
              </a>
            )}
            <button
              type="button"
              className={styles.removeBtn}
              onClick={() => handleRemove(index)}
              aria-label="移除来源"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
