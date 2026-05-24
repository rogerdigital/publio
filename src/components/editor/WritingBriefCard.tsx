'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, FileText, MessageSquare } from 'lucide-react';
import type { Brief } from '@/lib/briefs/types';
import type { Feedback } from '@/lib/feedback/types';
import * as styles from './WritingBriefCard.css';

interface WritingBriefCardProps {
  briefId: string;
}

export default function WritingBriefCard({ briefId }: WritingBriefCardProps) {
  const [brief, setBrief] = useState<Brief | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [relatedFeedback, setRelatedFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/briefs/${briefId}`, { cache: 'no-store' });
        const json = await res.json();
        if (json.ok) {
          setBrief(json.brief);
          if (json.brief.topicId) {
            const fbRes = await fetch(`/api/feedback?topicId=${json.brief.topicId}`);
            const fbJson = await fbRes.json();
            if (fbJson.feedback) setRelatedFeedback(fbJson.feedback.slice(0, 3));
          }
        }
      } catch {
        // silent — card is supplementary
      }
    }
    load();
  }, [briefId]);

  if (!brief) return null;

  return (
    <div className={styles.card}>
      <div
        className={styles.header}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setCollapsed(!collapsed);
          }
        }}
      >
        <span className={styles.headerTitle}>
          <FileText size={14} /> Brief
        </span>
        <span className={styles.collapseBtn}>
          {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </span>
      </div>

      {!collapsed && (
        <div className={styles.body}>
          {brief.thesis && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>核心观点</span>
              <span className={styles.fieldValue}>{brief.thesis}</span>
            </div>
          )}

          {brief.audience && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>目标读者</span>
              <span className={styles.fieldValue}>{brief.audience}</span>
            </div>
          )}

          {brief.tone && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>语气</span>
              <span className={styles.fieldValue}>{brief.tone}</span>
            </div>
          )}

          {brief.outline.length > 0 && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>大纲</span>
              <ul className={styles.outlineList}>
                {brief.outline.map((item, i) => (
                  <li key={i} className={styles.outlineItem}>
                    {item.heading}
                    {item.purpose ? ` — ${item.purpose}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {brief.sourceLinks.length > 0 && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>来源</span>
              <div className={styles.sourceList}>
                {brief.sourceLinks.map((link, i) =>
                  link.url ? (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.sourceItem}
                    >
                      {link.title || link.url}
                    </a>
                  ) : (
                    <span key={i} className={styles.sourceItem}>
                      {link.title}
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {!brief.thesis && !brief.audience && brief.outline.length === 0 && (
            <span className={styles.emptyHint}>Brief 尚未填写内容</span>
          )}

          {relatedFeedback.length > 0 && (
            <div className={styles.field}>
              <span className={styles.fieldLabel}>
                <MessageSquare size={12} /> 相似内容复盘
              </span>
              <div className={styles.sourceList}>
                {relatedFeedback.map((fb) => (
                  <span key={fb.id} className={styles.sourceItem}>
                    {fb.summary}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
