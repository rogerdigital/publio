'use client';

import { useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import type { Topic } from '@/lib/topics/types';
import type { Signal } from '@/lib/signals/types';
import type { AgentStreamEvent } from '@/lib/agent/types';
import * as styles from './TopicPackPanel.css';

interface TopicPack {
  backgroundSummary: string;
  coreFacts: string[];
  angles: Array<{ title: string; description: string }>;
  targetAudience: string;
  counterArguments: string[];
  structureSuggestion: { format: string; outline: string[] };
  platformAdvice: Array<{ platform: string; advice: string }>;
  sourceLinks: Array<{ title: string; url: string }>;
}

interface Props {
  topic: Topic;
  signals?: Signal[];
  onSaveAsBrief: (pack: TopicPack) => void;
  onDismiss: () => void;
}

export default function TopicPackPanel({ topic, signals, onSaveAsBrief, onDismiss }: Props) {
  const [loading, setLoading] = useState(false);
  const [rawContent, setRawContent] = useState('');
  const [pack, setPack] = useState<TopicPack | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setRawContent('');
    setPack(null);
    setError('');

    try {
      const response = await fetch('/api/agent/topic-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: {
            title: topic.title,
            angle: topic.angle,
            summary: topic.summary,
            targetAudience: topic.targetAudience,
            tags: topic.tags,
            recommendedPlatforms: topic.recommendedPlatforms,
          },
          signals: signals?.slice(0, 10).map((s) => ({
            title: s.title,
            summary: s.summary,
            url: s.url,
            author: s.author,
            publishedAt: s.publishedAt,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        setError('写作包生成失败');
        return;
      }

      const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event: AgentStreamEvent = JSON.parse(line.slice(6));
            if (event.type === 'delta') {
              accumulated += event.content;
              setRawContent(accumulated);
            }
          } catch {
            // skip malformed
          }
        }
      }

      try {
        const jsonStart = accumulated.indexOf('{');
        const jsonEnd = accumulated.lastIndexOf('}');
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const parsed = JSON.parse(accumulated.slice(jsonStart, jsonEnd + 1)) as TopicPack;
          setPack(parsed);
        } else {
          setError('写作包格式解析失败，请重试');
        }
      } catch {
        setError('写作包 JSON 解析失败，请重试');
      }
    } catch {
      setError('请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate on mount
  if (!loading && !rawContent && !error) {
    void generate();
  }

  if (loading && !rawContent) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingRow}>
          <Loader2 size={14} className="animate-spin" />
          正在生成写作包…
        </div>
      </div>
    );
  }

  if (error && !pack) {
    return (
      <div className={styles.container}>
        <div className={styles.errorRow}>{error}</div>
        <div className={styles.actionRow}>
          <button className={styles.dismissBtn} onClick={onDismiss}>
            <X size={12} /> 关闭
          </button>
        </div>
      </div>
    );
  }

  if (!pack) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingRow}>
          <Loader2 size={14} className="animate-spin" />
          解析写作包…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <p className={styles.sectionTitle}>背景</p>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--color-text)', margin: 0 }}>
        {pack.backgroundSummary}
      </p>

      <p className={styles.sectionTitle}>核心事实</p>
      <ul className={styles.factList}>
        {pack.coreFacts.map((fact, i) => (
          <li key={i}>{fact}</li>
        ))}
      </ul>

      <p className={styles.sectionTitle}>可写角度</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {pack.angles.map((angle, i) => (
          <div key={i} className={styles.angleCard}>
            <p className={styles.angleTitle}>{angle.title}</p>
            <p className={styles.angleDesc}>{angle.description}</p>
          </div>
        ))}
      </div>

      <p className={styles.sectionTitle}>目标读者</p>
      <p style={{ fontSize: 13, color: 'var(--color-text)', margin: 0 }}>{pack.targetAudience}</p>

      <p className={styles.sectionTitle}>反方观点</p>
      <ul className={styles.factList}>
        {pack.counterArguments.map((arg, i) => (
          <li key={i}>{arg}</li>
        ))}
      </ul>

      <p className={styles.sectionTitle}>结构建议 — {pack.structureSuggestion.format}</p>
      <ul className={styles.factList}>
        {pack.structureSuggestion.outline.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>

      {pack.platformAdvice.length > 0 && (
        <>
          <p className={styles.sectionTitle}>渠道建议</p>
          <div className={styles.platformRow}>
            {pack.platformAdvice.map((pa, i) => (
              <span key={i} className={styles.platformChip} title={pa.advice}>
                {pa.platform}
              </span>
            ))}
          </div>
        </>
      )}

      {pack.sourceLinks.length > 0 && (
        <>
          <p className={styles.sectionTitle}>来源</p>
          <div className={styles.sourceRow}>
            {pack.sourceLinks.map((sl, i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a
                  href={sl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.sourceLink}
                >
                  {sl.title}
                </a>
              </span>
            ))}
          </div>
        </>
      )}

      <div className={styles.actionRow}>
        <button className={styles.saveBtn} onClick={() => onSaveAsBrief(pack)}>
          <Save size={12} /> 保存为 Brief
        </button>
        <button className={styles.dismissBtn} onClick={onDismiss}>
          <X size={12} /> 关闭
        </button>
      </div>
    </div>
  );
}
