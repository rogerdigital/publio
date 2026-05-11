'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bookmark, EyeOff, Inbox, Plus, RefreshCw } from 'lucide-react';
import type { Signal, SignalStatus } from '@/lib/signals/types';
import * as styles from './SignalInbox.css';

interface SignalInboxProps {
  onConvertToTopic?: (signalIds: string[]) => void;
}

const STATUS_LABELS: Record<SignalStatus, string> = {
  new: '新',
  saved: '已保存',
  dismissed: '已忽略',
  converted: '已转选题',
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - Date.parse(dateStr);
  if (diff < 0) return '刚刚';
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  const days = Math.floor(hours / 24);
  return `${days} 天前`;
}

function ScoreIndicator({ label, value }: { label: string; value: number }) {
  const pct = Math.round(value * 100);
  return (
    <span className={styles.scoreBar}>
      {label}
      <span className={styles.scoreTrack}>
        <span className={styles.scoreFill} style={{ width: `${pct}%` }} />
      </span>
    </span>
  );
}

export default function SignalInbox({ onConvertToTopic }: SignalInboxProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<SignalStatus | 'all'>('all');

  const fetchSignals = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'all' && filter !== 'dismissed') {
        params.set('status', filter);
      }
      const res = await fetch(`/api/signals?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '加载失败');
      setSignals(json.signals);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载信号失败');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSignals();
  }, [fetchSignals]);

  const updateSignalStatus = async (id: string, status: SignalStatus) => {
    try {
      const res = await fetch(`/api/signals/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setSignals((prev) => prev.map((s) => (s.id === id ? json.signal : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    }
  };

  const handleConvertToTopic = async (signalId: string) => {
    if (onConvertToTopic) {
      onConvertToTopic([signalId]);
    } else {
      try {
        const res = await fetch('/api/topics/from-signals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ signalIds: [signalId] }),
        });
        const json = await res.json();
        if (!json.ok) throw new Error(json.error);
        setSignals((prev) =>
          prev.map((s) => (s.id === signalId ? { ...s, status: 'converted' as const } : s)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : '转换选题失败');
      }
    }
  };

  const visibleSignals =
    filter === 'all'
      ? signals.filter((s) => s.status !== 'dismissed')
      : filter === 'dismissed'
        ? signals.filter((s) => s.status === 'dismissed')
        : signals;

  return (
    <div className={styles.inboxContainer}>
      <div className={styles.filterRow}>
        {(['all', 'new', 'saved', 'dismissed', 'converted'] as const).map((f) => (
          <button
            key={f}
            className={styles.filterChip({ active: filter === f })}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : STATUS_LABELS[f]}
          </button>
        ))}
        <button
          className={styles.filterChip({})}
          onClick={() => {
            setLoading(true);
            fetchSignals();
          }}
          title="刷新"
        >
          <RefreshCw size={12} />
        </button>
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>加载资讯信号中...</div>
      ) : visibleSignals.length === 0 ? (
        <div className={styles.emptyBox}>
          <Inbox size={32} strokeWidth={1.5} color="var(--color-text-muted, #5C5952)" />
          <p className={styles.emptyTitle}>还没有资讯信号</p>
          <p className={styles.emptyDesc}>先刷新资讯源抓取最新内容，或手动添加一条感兴趣的链接。</p>
        </div>
      ) : (
        <div className={styles.signalList}>
          {visibleSignals.map((signal) => (
            <article key={signal.id} className={styles.signalCard}>
              <div className={styles.signalHeader}>
                <h4 className={styles.signalTitle}>
                  {signal.url ? (
                    <a
                      href={signal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.signalTitleLink}
                    >
                      {signal.title}
                    </a>
                  ) : (
                    signal.title
                  )}
                </h4>
                <span className={styles.statusBadge({ status: signal.status })}>
                  {STATUS_LABELS[signal.status]}
                </span>
              </div>

              {signal.summary && <p className={styles.signalSummary}>{signal.summary}</p>}

              <div className={styles.signalMeta}>
                <span>{signal.sourceId}</span>
                <span className={styles.metaDot} />
                <span>{formatTimeAgo(signal.capturedAt)}</span>
                {signal.publishedAt && (
                  <>
                    <span className={styles.metaDot} />
                    <span>发布于 {formatTimeAgo(signal.publishedAt)}</span>
                  </>
                )}
                <span className={styles.metaDot} />
                <ScoreIndicator label="写作" value={signal.score.writingPotential} />
                <ScoreIndicator label="可信" value={signal.score.credibility} />
              </div>

              {signal.tags.length > 0 && (
                <div className={styles.signalTags}>
                  {signal.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className={styles.tagBadge}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {signal.status !== 'converted' && (
                <div className={styles.signalActions}>
                  {signal.status !== 'saved' && (
                    <button
                      className={styles.actionBtn({ variant: 'save' })}
                      onClick={() => updateSignalStatus(signal.id, 'saved')}
                    >
                      <Bookmark size={12} /> 保存
                    </button>
                  )}
                  {signal.status !== 'dismissed' && (
                    <button
                      className={styles.actionBtn({ variant: 'dismiss' })}
                      onClick={() => updateSignalStatus(signal.id, 'dismissed')}
                    >
                      <EyeOff size={12} /> 忽略
                    </button>
                  )}
                  <button
                    className={styles.actionBtn({ variant: 'topic' })}
                    onClick={() => handleConvertToTopic(signal.id)}
                  >
                    <Plus size={12} /> 加入选题
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
