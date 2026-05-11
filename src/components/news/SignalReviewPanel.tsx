'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import type { Signal } from '@/lib/signals/types';
import type { AgentStreamEvent } from '@/lib/agent/types';

export default function SignalReviewPanel() {
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState('');
  const [error, setError] = useState('');

  async function handleReview() {
    setLoading(true);
    setReview('');
    setError('');

    try {
      const signalsRes = await fetch('/api/signals?status=new&limit=20', { cache: 'no-store' });
      if (!signalsRes.ok) {
        setError('获取信号列表失败');
        setLoading(false);
        return;
      }
      const { signals } = (await signalsRes.json()) as { signals: Signal[] };
      if (!signals || signals.length === 0) {
        setError('暂无新信号可供分析');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/agent/signal-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signals: signals.map((s) => ({
            title: s.title,
            summary: s.summary,
            tags: s.tags,
          })),
        }),
      });

      if (!response.ok || !response.body) {
        setError('筛选建议请求失败');
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
              setReview(accumulated);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch {
      setError('请求失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 16, padding: '0 4px' }}>
      {!review && !loading && (
        <button
          type="button"
          onClick={handleReview}
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--color-border-strong, #c9b9a8)',
            borderRadius: 8,
            background: 'var(--color-surface, #fff)',
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--color-text, #3d2e24)',
            cursor: 'pointer',
          }}
        >
          <Sparkles size={14} />
          AI 筛选建议
        </button>
      )}

      {loading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--color-text-muted, #8c7b6e)',
          }}
        >
          <Loader2 size={14} className="animate-spin" />
          分析信号中…
        </div>
      )}

      {review && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            borderRadius: 8,
            background: 'var(--color-bg-elevated, #faf6f2)',
            border: '1px solid var(--color-border, #e8ddd4)',
            fontSize: 13,
            lineHeight: 1.7,
            color: 'var(--color-text, #3d2e24)',
            whiteSpace: 'pre-wrap',
          }}
        >
          {review}
        </div>
      )}

      {error && (
        <p style={{ fontSize: 13, color: 'var(--color-error-text, #c0392b)', margin: '8px 0 0' }}>
          {error}
        </p>
      )}
    </div>
  );
}
