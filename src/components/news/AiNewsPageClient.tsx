'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import TopicDeskHeader from '@/components/news/TopicDeskHeader';
import TopicSignalCard from '@/components/news/TopicSignalCard';
import type { AiNewsDeskCandidate } from '@/lib/aiNews';
import {
  buildResearchDraftMarkdown,
  NEWS_DRAFT_STORAGE_KEY,
} from '@/lib/newsDraft';

interface AiNewsResponse {
  success: boolean;
  generatedAt?: string;
  totalSignals?: number;
  totalCandidates?: number;
  todayCandidates?: AiNewsDeskCandidate[];
  followCandidates?: AiNewsDeskCandidate[];
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
  return `${diffHours.toFixed(1)} 小时前`;
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

// 模块级缓存：tab 切换回来时直接复用，不重复抓取；整页刷新后清空重新抓取
interface NewsState {
  todayCandidates: AiNewsDeskCandidate[];
  followCandidates: AiNewsDeskCandidate[];
  generatedAt: string;
  totalSignals: number;
  totalCandidates: number;
}
let cachedNewsState: NewsState | null = null;

export default function AiNewsPageClient() {
  const router = useRouter();
  const [todayCandidates, setTodayCandidates] = useState<AiNewsDeskCandidate[]>([]);
  const [followCandidates, setFollowCandidates] = useState<AiNewsDeskCandidate[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [totalSignals, setTotalSignals] = useState(0);
  const [totalCandidates, setTotalCandidates] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const hasDeskDataRef = useRef(false);

  const allCandidates = [...todayCandidates, ...followCandidates];

  const writeDraftAndOpenEditor = (title: string, content: string) => {
    window.localStorage.setItem(
      NEWS_DRAFT_STORAGE_KEY,
      JSON.stringify({ title, content }),
    );
    router.push('/');
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
          whyNow: item.whyNow,
          whatHappened: item.researchBrief.whatHappened,
          whyItMatters: item.researchBrief.whyItMatters,
          whoIsAffected: item.researchBrief.whoIsAffected,
          recommendedAngles: item.researchBrief.recommendedAngles,
          background: item.researchBrief.background,
          evidence: item.researchBrief.evidence.map((entry) => ({
            ...entry,
            publishedAt: formatDateTime(entry.publishedAt),
          })),
        },
      ],
    });
    writeDraftAndOpenEditor(item.title, content);
  };

  const loadNews = async (isManualRefresh = false) => {
    try {
      setError('');
      setRefreshError('');
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch('/api/ai-news', { cache: 'no-store' });
      const data: AiNewsResponse = await response.json();

      if (!response.ok || !data.success || !data.todayCandidates || !data.followCandidates) {
        throw new Error(data.message || '新闻抓取失败，请稍后重试。');
      }

      const nextTodayCandidates = data.todayCandidates
        .map((candidate) => normalizeCandidate(candidate))
        .filter((candidate): candidate is AiNewsDeskCandidate => candidate !== null);

      const nextFollowCandidates = data.followCandidates
        .map((candidate) => normalizeCandidate(candidate))
        .filter((candidate): candidate is AiNewsDeskCandidate => candidate !== null);

      setTodayCandidates(nextTodayCandidates);
      setFollowCandidates(nextFollowCandidates);
      setGeneratedAt(data.generatedAt || '');
      setTotalSignals(data.totalSignals || 0);
      setTotalCandidates(data.totalCandidates || 0);
      hasDeskDataRef.current = nextTodayCandidates.length > 0 || nextFollowCandidates.length > 0;
      cachedNewsState = {
        todayCandidates: nextTodayCandidates,
        followCandidates: nextFollowCandidates,
        generatedAt: data.generatedAt || '',
        totalSignals: data.totalSignals || 0,
        totalCandidates: data.totalCandidates || 0,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : '新闻抓取失败，请稍后重试。';
      if (isManualRefresh && hasDeskDataRef.current) {
        setRefreshError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (cachedNewsState) {
      setTodayCandidates(cachedNewsState.todayCandidates);
      setFollowCandidates(cachedNewsState.followCandidates);
      setGeneratedAt(cachedNewsState.generatedAt);
      setTotalSignals(cachedNewsState.totalSignals);
      setTotalCandidates(cachedNewsState.totalCandidates);
      hasDeskDataRef.current =
        cachedNewsState.todayCandidates.length > 0 || cachedNewsState.followCandidates.length > 0;
    } else {
      void loadNews();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <TopicDeskHeader
        generatedAt={formatDeskTime(generatedAt)}
        todayCount={todayCandidates.length}
        followCount={followCandidates.length}
        onRefresh={() => void loadNews(true)}
        loading={loading}
        refreshing={refreshing}
      />

      <div className="space-y-5">
        {refreshError ? (
          <div
            className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] px-5 py-4"
            role="status"
            aria-live="polite"
          >
            <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--wb-accent)]">
              刷新未更新
            </p>
            <p className="mt-2 text-sm leading-7 text-[color:var(--wb-muted)]">
              {refreshError} 下面保留的是上一次成功加载的内容。
            </p>
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-5">
            {[0, 1].map((i) => (
              <div key={i} className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-3 w-24 rounded bg-[color:var(--wb-canvas-deep)]" />
                  <div className="h-9 w-4/5 rounded bg-[color:var(--wb-canvas-deep)]" />
                  <div className="h-4 w-full rounded bg-[color:var(--wb-canvas-deep)]" />
                  <div className="h-4 w-2/3 rounded bg-[color:var(--wb-canvas-deep)]" />
                </div>
              </div>
            ))}
          </div>
        ) : error && allCandidates.length === 0 ? (
          <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-8">
            <p className="text-lg font-medium text-[color:var(--wb-ink)]">新闻抓取失败</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--wb-muted)]">{error}</p>
          </div>
        ) : allCandidates.length === 0 ? (
          <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] p-8 text-center">
            <p className="text-lg font-medium text-[color:var(--wb-ink)]">选题桌暂无内容</p>
            <p className="mt-3 text-sm leading-7 text-[color:var(--wb-muted)]">
              点击右上角「抓取选题」开始抓取最新 AI 话题信号。
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            <CandidateSection
              title="今天能发"
              items={todayCandidates}
              offset={0}
              onCreateDraft={createSingleNewsDraft}
            />
            <CandidateSection
              title="还能追"
              items={followCandidates}
              offset={todayCandidates.length}
              onCreateDraft={createSingleNewsDraft}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function formatDeskTime(value: string) {
  return value ? formatDateTime(value) : '准备中';
}

function CandidateSection({
  title,
  items,
  offset,
  onCreateDraft,
}: {
  title: string;
  items: AiNewsDeskCandidate[];
  offset: number;
  onCreateDraft: (item: AiNewsDeskCandidate) => void;
}) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <h2 className="text-[15px] font-semibold text-[color:var(--wb-ink)]">{title}</h2>
        <span className="text-[13px] text-[color:var(--wb-muted)]">{items.length} 条</span>
      </div>
      <div className="space-y-5">
        {items.map((item, index) => (
          <TopicSignalCard
            key={item.clusterId}
            item={item}
            indexLabel={buildSectionLabel(offset + index)}
            relativeLabel={formatRelativeHours(item.latestPublishedAt)}
            formattedDate={formatDateTime(item.latestPublishedAt)}
            onCreateDraft={onCreateDraft}
          />
        ))}
      </div>
    </section>
  );
}
