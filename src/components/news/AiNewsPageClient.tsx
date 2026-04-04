'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import PageSection from '@/components/layout/PageSection';
import ResearchNotesPanel from '@/components/news/ResearchNotesPanel';
import TopicDeskHeader from '@/components/news/TopicDeskHeader';
import TopicSignalCard, {
  type TopicSignalItem,
} from '@/components/news/TopicSignalCard';
import {
  buildNewsArticleMarkdown,
  NEWS_DRAFT_STORAGE_KEY,
} from '@/lib/newsDraft';

interface AiNewsBrief {
  title: string;
  summary: string;
  relatedTitles: string[];
}

interface AiNewsResponse {
  success: boolean;
  generatedAt?: string;
  windowHours?: number;
  total?: number;
  briefs?: AiNewsBrief[];
  items?: TopicSignalItem[];
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

  if (timestamp === null) {
    return '时间待确认';
  }

  return dateFormatter.format(timestamp);
}

function formatRelativeHours(value: string) {
  const timestamp = parseDateValue(value);

  if (timestamp === null) {
    return '时间待确认';
  }

  const diffMs = Date.now() - timestamp;
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffMs < 0) {
    return '刚刚更新';
  }

  if (diffHours < 1) {
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `${minutes} 分钟前`;
  }

  return `${diffHours.toFixed(1)} 小时前`;
}

function buildSectionLabel(index: number) {
  return String(index + 1).padStart(2, '0');
}

function normalizeItem(item: Partial<TopicSignalItem>): TopicSignalItem | null {
  if (!item.link || !item.title) {
    return null;
  }

  return {
    title: item.title,
    link: item.link,
    source: item.source || '来源待确认',
    publishedAt: item.publishedAt || '',
    summary: item.summary || '',
    score: typeof item.score === 'number' ? item.score : 0,
    topic: item.topic || '行业动态',
    emoji: item.emoji || '📰',
    deck: item.deck || item.summary || item.title,
    body: item.body || item.summary || '原始来源未提供更多正文，请结合原文补充细节。',
    takeaway:
      item.takeaway || '这条新闻值得继续跟进，后续可以结合原文补充更具体的行业判断。',
    imageUrl: item.imageUrl,
  };
}

function normalizeBrief(brief: Partial<AiNewsBrief>): AiNewsBrief | null {
  if (!brief.title) {
    return null;
  }

  return {
    title: brief.title,
    summary: brief.summary || '该热点已进入近 12 小时新闻窗口，建议结合原文继续补充判断。',
    relatedTitles: Array.isArray(brief.relatedTitles) ? brief.relatedTitles : [brief.title],
  };
}

function buildDeskIntro(items: TopicSignalItem[], briefs: AiNewsBrief[]) {
  const highlights = briefs.slice(0, 3).map((brief) => brief.title);

  if (highlights.length > 0) {
    return `过去 12 小时，AI 话题主要集中在 ${highlights.join('、')}。这里把这些信号整理成可继续编辑的候选列表。`;
  }

  if (items.length > 0) {
    return '过去 12 小时内的 AI 候选信号已经汇入选题桌，可以从标题、来源、评分和时间戳继续判断优先级。';
  }

  return '过去 12 小时内暂未抓取到符合条件的 AI 话题，保持桌面空置，等待下一次抓取。';
}

export default function AiNewsPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<TopicSignalItem[]>([]);
  const [briefs, setBriefs] = useState<AiNewsBrief[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [windowHours, setWindowHours] = useState(12);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const hasDeskDataRef = useRef(false);

  const writeDraftAndOpenEditor = (title: string, content: string) => {
    window.localStorage.setItem(
      NEWS_DRAFT_STORAGE_KEY,
      JSON.stringify({ title, content }),
    );
    router.push('/');
  };

  const createSingleNewsDraft = (item: TopicSignalItem) => {
    const content = buildNewsArticleMarkdown({
      headline: item.title,
      intro:
        '这里是一则基于最近 12 小时 AI 热点新闻整理的中文快讯草稿，你可以直接补充判断、背景和面向读者的解读后发布。',
      sections: [
        {
          title: item.title,
          emoji: item.emoji,
          deck: item.deck,
          summary: item.summary || '原始来源未提供摘要，请结合原文补充细节。',
          body: item.body,
          takeaway: item.takeaway,
          source: item.source,
          publishedAt: formatDateTime(item.publishedAt),
          link: item.link,
          imageUrl: item.imageUrl,
        },
      ],
    });

    writeDraftAndOpenEditor(item.title, content);
  };

  const createDigestDraft = () => {
    const topItems = items.slice(0, 5);
    const title = 'AI 行业 12 小时热点速览';
    const intro = buildDeskIntro(items, briefs);

    const content = buildNewsArticleMarkdown({
      headline: title,
      intro,
      sections: topItems.map((item) => ({
        title: item.title,
        emoji: item.emoji,
        deck: item.deck,
        summary: item.summary || '原始来源未提供摘要，请结合原文补充细节。',
        body: item.body,
        takeaway: item.takeaway,
        source: item.source,
        publishedAt: formatDateTime(item.publishedAt),
        link: item.link,
        imageUrl: item.imageUrl,
      })),
    });

    writeDraftAndOpenEditor(title, content);
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

      const response = await fetch('/api/ai-news', {
        cache: 'no-store',
      });
      const data: AiNewsResponse = await response.json();

      if (!response.ok || !data.success || !data.items) {
        throw new Error(data.message || '新闻抓取失败，请稍后重试。');
      }

      const normalizedItems = data.items
        .map((item) => normalizeItem(item))
        .filter((item): item is TopicSignalItem => item !== null);

      const normalizedBriefs = (data.briefs || [])
        .map((brief) => normalizeBrief(brief))
        .filter((brief): brief is AiNewsBrief => brief !== null);

      setItems(normalizedItems);
      setBriefs(normalizedBriefs);
      setGeneratedAt(data.generatedAt || '');
      setWindowHours(data.windowHours || 12);
      hasDeskDataRef.current = normalizedItems.length > 0 || normalizedBriefs.length > 0;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : '新闻抓取失败，请稍后重试。';

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
    void loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--wb-bg-elevated)_0%,#f1e6d8_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <PageSection className="space-y-6">
        <TopicDeskHeader
          generatedAt={formatDeskTime(generatedAt)}
          itemCount={items.length}
          briefCount={briefs.length}
          onRefresh={() => void loadNews(true)}
          onBuildDigest={createDigestDraft}
          loading={loading}
          refreshing={refreshing}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,392px)] lg:items-start xl:grid-cols-[minmax(0,1.24fr)_392px]">
          <main className="min-w-0 space-y-5">
            <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.6)] px-5 py-4 shadow-[var(--wb-shadow-tight)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[color:var(--wb-accent)]">
                    Editorial Queue
                  </p>
                  <h2
                    className="mt-2 text-[22px] leading-tight text-[color:var(--wb-ink)]"
                    style={{ fontFamily: 'var(--wb-font-serif)' }}
                  >
                    候选信号列表
                  </h2>
                </div>
                <p className="max-w-[28rem] text-sm leading-7 text-[color:var(--wb-muted)]">
                  中间栏按选题强度往下排，保留标题、来源、时间和编辑判断，适合继续筛选或直接转成稿件。
                </p>
              </div>
            </div>

            {refreshError ? (
              <div
                className="rounded-[var(--wb-radius-xl)] border border-[rgba(185,124,68,0.28)] bg-[rgba(255,247,238,0.9)] px-5 py-4 text-[color:var(--wb-ink)] shadow-[var(--wb-shadow-tight)]"
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
                <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] p-6 shadow-[var(--wb-shadow-tight)]">
                  <div className="mx-auto max-w-3xl animate-pulse space-y-4">
                    <div className="h-3 w-24 rounded bg-[rgba(210,192,178,0.75)]" />
                    <div className="h-9 w-4/5 rounded bg-[rgba(210,192,178,0.55)]" />
                    <div className="h-4 w-full rounded bg-[rgba(210,192,178,0.4)]" />
                    <div className="h-4 w-full rounded bg-[rgba(210,192,178,0.4)]" />
                    <div className="h-4 w-2/3 rounded bg-[rgba(210,192,178,0.4)]" />
                  </div>
                </div>
                <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] p-6 shadow-[var(--wb-shadow-tight)]">
                  <div className="mx-auto max-w-3xl animate-pulse space-y-4">
                    <div className="h-3 w-20 rounded bg-[rgba(210,192,178,0.75)]" />
                    <div className="h-8 w-3/4 rounded bg-[rgba(210,192,178,0.55)]" />
                    <div className="h-4 w-full rounded bg-[rgba(210,192,178,0.4)]" />
                    <div className="h-4 w-11/12 rounded bg-[rgba(210,192,178,0.4)]" />
                    <div className="h-4 w-5/6 rounded bg-[rgba(210,192,178,0.4)]" />
                  </div>
                </div>
              </div>
            ) : error && items.length === 0 ? (
              <div className="rounded-[var(--wb-radius-xl)] border border-[rgba(171,84,84,0.25)] bg-[rgba(255,245,245,0.92)] p-8 text-[color:#964646] shadow-[var(--wb-shadow-tight)]">
                <p className="text-lg font-medium text-[color:#7f3636]">新闻抓取失败</p>
                <p className="mt-3 text-sm leading-7">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.64)] p-8 text-center shadow-[var(--wb-shadow-tight)]">
                <p className="text-lg font-medium text-[color:var(--wb-ink)]">
                  过去 12 小时内暂未抓取到符合条件的 AI 话题
                </p>
                <p className="mt-3 text-sm leading-7 text-[color:var(--wb-muted)]">
                  可以稍后刷新，或继续扩展新闻源与筛选规则。
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {items.map((item, index) => (
                  <TopicSignalCard
                    key={`${item.link}-${index}`}
                    item={item}
                    indexLabel={buildSectionLabel(index)}
                    relativeLabel={formatRelativeHours(item.publishedAt)}
                    formattedDate={formatDateTime(item.publishedAt)}
                    onCreateDraft={createSingleNewsDraft}
                  />
                ))}
              </div>
            )}
          </main>

          <ResearchNotesPanel
            briefs={briefs}
            generatedAt={formatDeskTime(generatedAt)}
            itemCount={items.length}
            briefCount={briefs.length}
            windowHours={windowHours}
          />
        </div>
      </PageSection>
    </div>
  );
}

function formatDeskTime(value: string) {
  return value ? formatDateTime(value) : '准备中';
}
