'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  Lightbulb,
  PenLine,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { Topic, TopicStatus } from '@/lib/topics/types';
import type { Signal } from '@/lib/signals/types';
import type { AggregateMetrics } from '@/lib/metrics/types';
import BriefEditor from '@/components/briefs/BriefEditor';
import TopicPackPanel from '@/components/news/TopicPackPanel';
import * as styles from './TopicLibrary.css';

const STATUS_LABELS: Record<TopicStatus, string> = {
  idea: '想法',
  researching: '调研中',
  briefed: '已有 Brief',
  drafting: '写作中',
  published: '已发布',
  archived: '已归档',
};

const PLATFORM_LABELS: Record<string, string> = {
  wechat: '公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X',
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

export default function TopicLibrary() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<TopicStatus | 'all'>('all');
  const [openBriefTopicId, setOpenBriefTopicId] = useState<string | null>(null);
  const [briefIds, setBriefIds] = useState<Record<string, string>>({});
  const [agentEnabled, setAgentEnabled] = useState(false);
  const [packTopicId, setPackTopicId] = useState<string | null>(null);
  const [topicSignals, setTopicSignals] = useState<Record<string, Signal[]>>({});
  const [topicPerf, setTopicPerf] = useState<Record<string, AggregateMetrics>>({});

  const fetchTopics = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.set('status', filter);
      }
      const res = await fetch(`/api/topics?${params.toString()}`, { cache: 'no-store' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '加载失败');
      setTopics(json.topics);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载选题失败');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  useEffect(() => {
    fetch('/api/agent/status')
      .then((r) => r.json())
      .then((d) => setAgentEnabled(d.available === true))
      .catch(() => setAgentEnabled(false));
  }, []);

  useEffect(() => {
    fetch('/api/metrics')
      .then((r) => r.json())
      .then((data) => {
        if (data.byTopic) setTopicPerf(data.byTopic);
      })
      .catch(() => {});
  }, []);

  const handleOpenPack = async (topic: Topic) => {
    setPackTopicId(topic.id);
    if (!topicSignals[topic.id] && topic.signalIds.length > 0) {
      try {
        const res = await fetch('/api/signals?limit=10', { cache: 'no-store' });
        const json = await res.json();
        if (json.signals) {
          const related = (json.signals as Signal[]).filter((s) => topic.signalIds.includes(s.id));
          setTopicSignals((prev) => ({ ...prev, [topic.id]: related }));
        }
      } catch {
        // signals optional, proceed without
      }
    }
  };

  const handleSavePackAsBrief = async (
    topicId: string,
    pack: {
      targetAudience: string;
      structureSuggestion: { format: string; outline: string[] };
      sourceLinks: Array<{ title: string; url: string }>;
      angles: Array<{ title: string; description: string }>;
      platformAdvice: Array<{ platform: string; advice: string }>;
    },
  ) => {
    try {
      setError('');
      const topic = topics.find((t) => t.id === topicId);
      if (!topic) return;

      const res = await fetch(`/api/topics/${topicId}/brief`, {
        method: 'POST',
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '创建 Brief 失败');

      const briefId = json.brief.id;
      const updateRes = await fetch(`/api/briefs/${briefId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audience: pack.targetAudience,
          outline: pack.structureSuggestion.outline.map((heading) => ({
            heading,
            purpose: '',
            evidenceSignalIds: [],
          })),
          sourceLinks: pack.sourceLinks.map((sl) => ({
            title: sl.title,
            url: sl.url,
          })),
          platformPlan: pack.platformAdvice.map((pa) => ({
            platform: pa.platform,
            intent: pa.advice,
            estimatedLength: 0,
          })),
        }),
      });
      if (updateRes.ok) {
        setBriefIds((prev) => ({ ...prev, [topicId]: briefId }));
        setTopics((prev) =>
          prev.map((t) => (t.id === topicId ? { ...t, status: 'briefed' as const } : t)),
        );
      }
      setPackTopicId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存 Brief 失败');
    }
  };

  const handleCreateBrief = async (topicId: string) => {
    try {
      setError('');
      const res = await fetch(`/api/topics/${topicId}/brief`, { method: 'POST' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || '创建 Brief 失败');
      setBriefIds((prev) => ({ ...prev, [topicId]: json.brief.id }));
      setOpenBriefTopicId(topicId);
      if (json.created) {
        setTopics((prev) =>
          prev.map((t) => (t.id === topicId ? { ...t, status: 'briefed' as const } : t)),
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建 Brief 失败');
    }
  };

  const handleStartWriting = async (topicId: string) => {
    try {
      setError('');
      const briefRes = await fetch(`/api/topics/${topicId}/brief`, { method: 'POST' });
      const briefJson = await briefRes.json();
      if (!briefJson.ok) throw new Error(briefJson.error || '获取 Brief 失败');

      const brief = briefJson.brief;
      const draftRes = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: brief.workingTitle || '未命名稿件',
          content: `> 基于 Brief 开始写作\n\n`,
          source: 'manual',
          topicId,
          briefId: brief.id,
          contentGoal: brief.thesis,
        }),
      });
      const draftJson = await draftRes.json();
      if (!draftJson.ok) throw new Error(draftJson.error || '创建稿件失败');

      setTopics((prev) =>
        prev.map((t) => (t.id === topicId ? { ...t, status: 'drafting' as const } : t)),
      );
      router.push(`/?draftId=${draftJson.draft.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '开始写作失败');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      const res = await fetch(`/api/topics/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setTopics((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'archived' as const } : t)),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '归档失败');
    }
  };

  const visibleTopics = filter === 'all' ? topics.filter((t) => t.status !== 'archived') : topics;

  return (
    <div className={styles.container}>
      <div className={styles.filterRow}>
        {(
          ['all', 'idea', 'researching', 'briefed', 'drafting', 'published', 'archived'] as const
        ).map((f) => (
          <button
            key={f}
            className={styles.filterChip({ active: filter === f })}
            onClick={() => {
              setFilter(f);
              setLoading(true);
            }}
          >
            {f === 'all' ? '全部' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {error && <div className={styles.errorMsg}>{error}</div>}

      {loading ? (
        <div className={styles.loadingState}>加载选题中...</div>
      ) : visibleTopics.length === 0 ? (
        <div className={styles.emptyBox}>
          <Lightbulb size={32} strokeWidth={1.5} color="var(--color-text-muted, #5C5952)" />
          <p className={styles.emptyTitle}>还没有选题</p>
          <p className={styles.emptyDesc}>
            从资讯 Inbox 中选择感兴趣的信号，点击「加入选题」创建第一个选题。
          </p>
        </div>
      ) : (
        <div className={styles.topicList}>
          {visibleTopics.map((topic) => (
            <article key={topic.id} className={styles.topicCard}>
              <div className={styles.topicHeader}>
                <h4 className={styles.topicTitle}>{topic.title}</h4>
                <span className={styles.statusBadge({ status: topic.status })}>
                  {STATUS_LABELS[topic.status]}
                </span>
              </div>

              {topic.angle && <p className={styles.topicAngle}>角度：{topic.angle}</p>}

              <div className={styles.topicMeta}>
                <span>{topic.signalIds.length} 条关联资讯</span>
                <span className={styles.metaDot} />
                <span>创建于 {formatTimeAgo(topic.createdAt)}</span>
                {topic.writingValue > 0 && (
                  <>
                    <span className={styles.metaDot} />
                    <span>写作价值 {Math.round(topic.writingValue * 100)}%</span>
                  </>
                )}
              </div>

              {topic.tags.length > 0 && (
                <div className={styles.topicTags}>
                  {topic.tags.slice(0, 5).map((tag) => (
                    <span key={tag} className={styles.tagBadge}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {topic.recommendedPlatforms.length > 0 && (
                <div className={styles.topicTags}>
                  {topic.recommendedPlatforms.map((p) => (
                    <span key={p} className={styles.platformBadge}>
                      {PLATFORM_LABELS[p] || p}
                    </span>
                  ))}
                </div>
              )}

              {topicPerf[topic.id] && (
                <div className={styles.topicMeta}>
                  <TrendingUp size={12} />
                  <span>
                    历史表现：{topicPerf[topic.id].views.toLocaleString()} 阅读 ·{' '}
                    {topicPerf[topic.id].likes.toLocaleString()} 赞
                    {topicPerf[topic.id].postCount > 1 && ` · ${topicPerf[topic.id].postCount} 篇`}
                  </span>
                  {topicPerf[topic.id].views < 50 && topicPerf[topic.id].postCount > 0 && (
                    <span style={{ color: 'var(--color-warning, #c77c2e)', fontSize: 11 }}>
                      低表现风险
                    </span>
                  )}
                </div>
              )}

              {topic.status !== 'archived' && topic.status !== 'published' && (
                <div className={styles.topicActions}>
                  {(topic.status === 'briefed' || briefIds[topic.id]) && (
                    <button
                      className={styles.actionBtn({ variant: 'primary' })}
                      onClick={() => void handleStartWriting(topic.id)}
                    >
                      <PenLine size={12} /> 开始写作
                    </button>
                  )}
                  {agentEnabled && (
                    <button
                      className={styles.actionBtn({ variant: 'default' })}
                      onClick={() => {
                        if (packTopicId === topic.id) {
                          setPackTopicId(null);
                        } else {
                          void handleOpenPack(topic);
                        }
                      }}
                    >
                      <Sparkles size={12} />
                      {packTopicId === topic.id ? '收起写作包' : '生成写作包'}
                    </button>
                  )}
                  <button
                    className={styles.actionBtn({ variant: 'default' })}
                    onClick={() => {
                      if (openBriefTopicId === topic.id) {
                        setOpenBriefTopicId(null);
                      } else {
                        void handleCreateBrief(topic.id);
                      }
                    }}
                  >
                    <FileText size={12} />
                    {openBriefTopicId === topic.id
                      ? '收起 Brief'
                      : briefIds[topic.id]
                        ? '编辑 Brief'
                        : '创建 Brief'}
                    {openBriefTopicId === topic.id ? (
                      <ChevronUp size={12} />
                    ) : (
                      <ChevronDown size={12} />
                    )}
                  </button>
                  <button
                    className={styles.actionBtn({ variant: 'danger' })}
                    onClick={() => handleArchive(topic.id)}
                  >
                    <Archive size={12} /> 归档
                  </button>
                </div>
              )}

              {packTopicId === topic.id && (
                <TopicPackPanel
                  topic={topic}
                  signals={topicSignals[topic.id]}
                  onSaveAsBrief={(pack) => void handleSavePackAsBrief(topic.id, pack)}
                  onDismiss={() => setPackTopicId(null)}
                />
              )}

              {openBriefTopicId === topic.id && briefIds[topic.id] && (
                <BriefEditor briefId={briefIds[topic.id]} />
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
