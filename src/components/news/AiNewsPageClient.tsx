'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import TopicDeskHeader from '@/components/news/TopicDeskHeader';
import TopicSignalCard from '@/components/news/TopicSignalCard';
import FilterChipGroup from '@/components/ui/FilterChipGroup';
import type { AiNewsDeskCandidate } from '@/lib/aiNews';
import { buildResearchDraftMarkdown } from '@/lib/newsDraft';
import { createDraft } from '@/lib/drafts/client';
import { useAgentStore } from '@/stores/agentStore';
import type { AgentStreamEvent } from '@/lib/agent/types';
import type { AiNewsSourceType } from '@/lib/ai-news/types';
import EmptyState from '@/components/feedback/EmptyState';
import { Newspaper } from 'lucide-react';
import TopicRecommendationPanel from '@/components/copilot/TopicRecommendationPanel';
import * as styles from './news.css';

const SOURCE_TYPE_OPTIONS = [
  { value: 'all', label: '全部来源' },
  { value: 'media', label: '媒体' },
  { value: 'official', label: '官方' },
  { value: 'community', label: '社区' },
  { value: 'x', label: 'X' },
  { value: 'arxiv', label: 'arXiv' },
] as const;

const SCORE_OPTIONS = [
  { value: 'all', label: '全部分数' },
  { value: 'high', label: '高分 (≥70)' },
  { value: 'medium', label: '中等 (40-69)' },
] as const;

const TOPIC_DRAFT_MAP_KEY = 'publio-topic-draft-map';

function loadTopicDraftMap(): Record<string, string> {
  try {
    const raw = window.localStorage.getItem(TOPIC_DRAFT_MAP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function saveTopicDraftMap(map: Record<string, string>) {
  try {
    window.localStorage.setItem(TOPIC_DRAFT_MAP_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

interface AiNewsResponse {
  ok: boolean;
  generatedAt?: string;
  totalSignals?: number;
  totalCandidates?: number;
  candidates?: AiNewsDeskCandidate[];
  message?: string;
}

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

function parseDateValue(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function formatDateTime(value: string) {
  const timestamp = parseDateValue(value);
  if (timestamp === null) return '时间待确认';
  return dateFormatter.format(timestamp);
}

function formatRelativeHours(value: string) {
  const timestamp = parseDateValue(value);
  if (timestamp === null) return '时间待确认';

  const diffMs = Date.now() - timestamp;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) return '刚刚更新';
  if (diffHours < 1) {
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `${minutes} 分钟前`;
  }
  if (diffHours < 24) return `${diffHours.toFixed(1)} 小时前`;
  const days = Math.round(diffHours / 24);
  return `${days} 天前`;
}

function buildSectionLabel(index: number) {
  return String(index + 1).padStart(2, '0');
}

function normalizeCandidate(candidate: AiNewsDeskCandidate | null | undefined) {
  if (!candidate?.clusterId || !candidate.title || !candidate.primarySignal?.link) {
    return null;
  }
  return candidate;
}

interface NewsState {
  candidates: AiNewsDeskCandidate[];
  generatedAt: string;
  totalSignals: number;
  totalCandidates: number;
}
let cachedNewsState: NewsState | null = null;
const cachedBriefOpenMap: Map<string, boolean> = new Map();

export default function AiNewsPageClient() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<AiNewsDeskCandidate[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [totalSignals, setTotalSignals] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftError, setDraftError] = useState('');
  const [topicDraftMap, setTopicDraftMap] = useState<Record<string, string>>({});
  const [briefOpenMap, setBriefOpenMap] = useState<Map<string, boolean>>(cachedBriefOpenMap);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');
  const [scoreFilter, setScoreFilter] = useState<string>('all');
  const hasDataRef = useRef(false);

  const [agentEnabled, setAgentEnabled] = useState(false);
  const [deepResearchLoading, setDeepResearchLoading] = useState<Record<string, boolean>>({});
  const [deepResearchContent, setDeepResearchContent] = useState<Record<string, string>>({});
  const researchCache = useAgentStore((s) => s.researchCache);
  const cacheResearch = useAgentStore((s) => s.cacheResearch);

  const filteredCandidates = useMemo(() => {
    if (sourceTypeFilter === 'all' && scoreFilter === 'all') return candidates;
    return candidates.filter((c) => {
      if (
        sourceTypeFilter !== 'all' &&
        c.primarySignal.sourceType !== (sourceTypeFilter as AiNewsSourceType)
      )
        return false;
      if (scoreFilter === 'high' && c.totalScore < 70) return false;
      if (scoreFilter === 'medium' && (c.totalScore < 40 || c.totalScore >= 70)) return false;
      return true;
    });
  }, [candidates, sourceTypeFilter, scoreFilter]);

  useEffect(() => {
    fetch('/api/agent/status')
      .then((r) => r.json())
      .then((d) => setAgentEnabled(d.available === true))
      .catch(() => setAgentEnabled(false));
  }, []);

  useEffect(() => {
    const TTL = 60 * 60 * 1000;
    const restored: Record<string, string> = {};
    for (const [title, entry] of Object.entries(researchCache)) {
      if (Date.now() - entry.cachedAt > TTL) continue;
      const match = candidates.find((c) => c.title === title);
      if (match) restored[match.clusterId] = entry.analysis.raw;
    }
    if (Object.keys(restored).length > 0) {
      setDeepResearchContent((prev) => ({ ...prev, ...restored }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidates.length]);

  const handleDeepResearch = useCallback(
    async (item: AiNewsDeskCandidate) => {
      const clusterId = item.clusterId;
      setDeepResearchLoading((prev) => ({ ...prev, [clusterId]: true }));

      try {
        const response = await fetch('/api/agent/research', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clusterTitle: item.title,
            signals: item.signals?.map((s) => ({
              title: s.title,
              summary: s.summary || '',
              source: s.sourceName,
              publishedAt: s.publishedAt,
            })) ?? [
              {
                title: item.title,
                summary: item.whyNow,
                source: item.primarySignal.sourceName,
                publishedAt: item.primarySignal.publishedAt,
              },
            ],
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error('深度分析请求失败');
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
                setDeepResearchContent((prev) => ({ ...prev, [clusterId]: accumulated }));
              } else if (event.type === 'error') {
                throw new Error(event.error);
              }
            } catch (e) {
              if (e instanceof Error && e.message !== '深度分析请求失败') {
                // skip parse errors
              } else {
                throw e;
              }
            }
          }
        }

        cacheResearch({
          raw: accumulated,
          clusterTitle: item.title,
          generatedAt: new Date().toISOString(),
        });
      } catch {
        // On error, clear loading but keep any partial content
      } finally {
        setDeepResearchLoading((prev) => ({ ...prev, [clusterId]: false }));
      }
    },
    [cacheResearch],
  );

  const writeDraftAndOpenEditor = async (title: string, content: string, clusterId: string) => {
    try {
      setDraftError('');
      const draft = await createDraft({
        title,
        content,
        source: 'ai-news',
        topicClusterId: clusterId,
      });
      const updated = { ...loadTopicDraftMap(), [clusterId]: draft.id };
      saveTopicDraftMap(updated);
      setTopicDraftMap(updated);
      router.push(`/?draftId=${draft.id}`);
    } catch (err) {
      setDraftError(err instanceof Error ? err.message : '稿件创建失败，请稍后重试。');
    }
  };

  const createSingleNewsDraft = (item: AiNewsDeskCandidate) => {
    const content = buildResearchDraftMarkdown({
      headline: item.title,
      intro:
        '这里是一份基于 AI 选题工作台生成的研究底稿草稿。先保留编辑判断，再补充你的观点、案例和面向读者的切入角度。',
      sections: [
        {
          title: item.title,
          imageUrl: item.researchBrief.imageUrl,
          articleImages: item.researchBrief.articleImages,
          whyNow: item.whyNow,
          whatHappened: item.researchBrief.whatHappened,
          whyItMatters: item.researchBrief.whyItMatters,
          whoIsAffected: item.researchBrief.whoIsAffected,
          recommendedAngles: item.researchBrief.recommendedAngles,
          background: item.researchBrief.background,
          perspectives: item.researchBrief.perspectives.map((p) => ({
            ...p,
            publishedAt: formatDateTime(p.publishedAt),
          })),
          evidence: item.researchBrief.evidence.map((entry) => ({
            label: entry.label,
            sourceName: entry.sourceName,
            link: entry.link,
            publishedAt: formatDateTime(entry.publishedAt),
          })),
        },
      ],
      llmAnalysis: deepResearchContent[item.clusterId] || undefined,
    });
    void writeDraftAndOpenEditor(item.title, content, item.clusterId);
  };

  const loadNews = async () => {
    try {
      setError('');
      setLoading(true);

      const response = await fetch('/api/ai-news', { cache: 'no-store' });
      const data: AiNewsResponse = await response.json();

      if (!response.ok || !data.ok || !data.candidates) {
        throw new Error(data.message || '新闻加载失败，请稍后重试。');
      }

      const nextCandidates = data.candidates
        .map((candidate) => normalizeCandidate(candidate))
        .filter((candidate): candidate is AiNewsDeskCandidate => candidate !== null);

      setCandidates(nextCandidates);
      setGeneratedAt(data.generatedAt || '');
      setTotalSignals(data.totalSignals || 0);
      hasDataRef.current = nextCandidates.length > 0;
      cachedNewsState = {
        candidates: nextCandidates,
        generatedAt: data.generatedAt || '',
        totalSignals: data.totalSignals || 0,
        totalCandidates: data.totalCandidates || 0,
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : '新闻加载失败，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setTopicDraftMap(loadTopicDraftMap());

    if (cachedNewsState) {
      setCandidates(cachedNewsState.candidates);
      setGeneratedAt(cachedNewsState.generatedAt);
      setTotalSignals(cachedNewsState.totalSignals);
      hasDataRef.current = cachedNewsState.candidates.length > 0;
    } else {
      void loadNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.pageWrap}>
      <TopicDeskHeader generatedAt={formatDeskTime(generatedAt)} totalCount={candidates.length} />

      {agentEnabled && candidates.length > 0 && (
        <TopicRecommendationPanel
          clusters={candidates}
          onSelectTopic={(title) => {
            void writeDraftAndOpenEditor(
              title,
              `> 选题来源：AI 推荐\n\n开始围绕「${title}」撰写内容...`,
              `recommend-${Date.now()}`,
            );
          }}
        />
      )}

      {(sourceTypeFilter !== 'all' || scoreFilter !== 'all' || candidates.length > 0) && (
        <div className={styles.filterRow}>
          <FilterChipGroup
            options={SOURCE_TYPE_OPTIONS}
            value={sourceTypeFilter}
            onChange={setSourceTypeFilter}
          />
          <FilterChipGroup options={SCORE_OPTIONS} value={scoreFilter} onChange={setScoreFilter} />
        </div>
      )}

      {draftError ? (
        <div className={styles.refreshErrorBanner} role="status" aria-live="polite">
          <p className={styles.refreshErrorKicker}>转稿未完成</p>
          <p className={styles.refreshErrorText}>{draftError}</p>
        </div>
      ) : null}

      {loading ? (
        <div className={styles.skeletonList}>
          {[0, 1].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonInner}>
                <div className={styles.skeletonLineShort} />
                <div className={styles.skeletonLineTall} />
                <div className={styles.skeletonLineFull} />
                <div className={styles.skeletonLineMid} />
              </div>
            </div>
          ))}
        </div>
      ) : error && candidates.length === 0 ? (
        <div className={styles.stateCard}>
          <p className={styles.stateTitle}>新闻加载失败</p>
          <p className={styles.stateText}>{error}</p>
        </div>
      ) : candidates.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={24} />}
          title="暂无内容"
          description="数据正在准备中，系统每 30 分钟自动抓取最新 AI 话题信号，请稍后访问。"
        />
      ) : (
        <div className={styles.candidateSection}>
          {filteredCandidates.map((item, index) => (
            <TopicSignalCard
              key={item.clusterId}
              item={item}
              indexLabel={buildSectionLabel(index)}
              relativeLabel={formatRelativeHours(item.latestPublishedAt)}
              formattedDate={formatDateTime(item.latestPublishedAt)}
              draftId={topicDraftMap[item.clusterId]}
              showBrief={briefOpenMap.get(item.clusterId) ?? false}
              onBriefToggle={(open) => {
                cachedBriefOpenMap.set(item.clusterId, open);
                setBriefOpenMap(new Map(cachedBriefOpenMap));
              }}
              onCreateDraft={createSingleNewsDraft}
              agentEnabled={agentEnabled}
              onDeepResearch={handleDeepResearch}
              deepResearchContent={deepResearchContent[item.clusterId]}
              deepResearchLoading={deepResearchLoading[item.clusterId] ?? false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function formatDeskTime(value: string) {
  return value ? formatDateTime(value) : '准备中';
}
