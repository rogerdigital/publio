'use client';

import { useState } from 'react';
import { Lightbulb, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import type { TopicRecommendation } from '@/lib/copilot/types';
import type { AiNewsCluster } from '@/lib/ai-news/types';
import { useAgentStream } from '@/hooks/useAgentStream';
import { parseRecommendations } from '@/lib/copilot/recommend';
import * as styles from './copilot.css';

interface Props {
  clusters: AiNewsCluster[];
  onSelectTopic: (title: string) => void;
}

const engagementIcons = {
  high: TrendingUp,
  medium: Minus,
  low: TrendingDown,
};

const engagementLabels = {
  high: '高互动',
  medium: '中等',
  low: '低互动',
};

export default function TopicRecommendationPanel({ clusters, onSelectTopic }: Props) {
  const [recommendations, setRecommendations] = useState<TopicRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const agent = useAgentStream();

  const handleRecommend = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const res = await fetch('/api/copilot/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clusters }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? '推荐失败');
        return;
      }

      if (!res.body) {
        setError('无响应流');
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
      }

      // Parse SSE events to extract content
      const lines = buffer.split('\n');
      let content = '';
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data) as { choices?: Array<{ delta?: { content?: string } }> };
            content += parsed.choices?.[0]?.delta?.content ?? '';
          } catch {
            content += data;
          }
        }
      }

      const results = parseRecommendations(content);
      if (results.length === 0) {
        setError('未能解析推荐结果，请重试');
      } else {
        setRecommendations(results);
      }
    } catch {
      setError('请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <Lightbulb size={14} />
        <span>AI 选题推荐</span>
      </div>
      <p className={styles.panelHint}>基于品牌画像 + 当前热点，推荐适合你的内容选题。</p>

      {recommendations.length === 0 && !loading && (
        <button
          type="button"
          onClick={() => void handleRecommend()}
          disabled={loading || clusters.length === 0}
          className={styles.recommendBtn}
        >
          <Lightbulb size={14} />
          获取推荐
        </button>
      )}

      {loading && (
        <div className={styles.loadingRow}>
          <Loader2 size={16} className={styles.spinner} />
          <span>AI 分析中...</span>
        </div>
      )}

      {error && <p className={styles.errorText}>{error}</p>}

      {recommendations.length > 0 && (
        <div className={styles.recommendList}>
          {recommendations.map((rec, i) => {
            const Icon = engagementIcons[rec.estimatedEngagement];
            return (
              <div key={i} className={styles.recommendCard}>
                <div className={styles.recommendTitle}>{rec.title}</div>
                <p className={styles.recommendReason}>{rec.reason}</p>
                <p className={styles.recommendAngle}>
                  <strong>建议角度：</strong>
                  {rec.angle}
                </p>
                <div className={styles.recommendMeta}>
                  <span className={styles.engagementBadge}>
                    <Icon size={12} />
                    {engagementLabels[rec.estimatedEngagement]}
                  </span>
                  {rec.relatedSignals.length > 0 && (
                    <span className={styles.relatedCount}>
                      {rec.relatedSignals.length} 条相关新闻
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onSelectTopic(rec.title)}
                  className={styles.useTopicBtn}
                >
                  使用此选题
                </button>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => void handleRecommend()}
            disabled={loading}
            className={styles.refreshBtn}
          >
            换一批
          </button>
        </div>
      )}
    </div>
  );
}
