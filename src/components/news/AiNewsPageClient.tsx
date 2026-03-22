'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  RefreshCw,
  ExternalLink,
  Clock3,
  Newspaper,
  Sparkles,
  FileUp,
} from 'lucide-react';
import {
  buildNewsArticleMarkdown,
  NEWS_DRAFT_STORAGE_KEY,
} from '@/lib/newsDraft';

interface AiNewsItem {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  score: number;
  topic: string;
  emoji: string;
  deck: string;
  body: string;
  takeaway: string;
  imageUrl?: string;
}

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
  items?: AiNewsItem[];
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

function normalizeItem(item: Partial<AiNewsItem>): AiNewsItem | null {
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

export default function AiNewsPageClient() {
  const router = useRouter();
  const [items, setItems] = useState<AiNewsItem[]>([]);
  const [briefs, setBriefs] = useState<AiNewsBrief[]>([]);
  const [generatedAt, setGeneratedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const writeDraftAndOpenEditor = (title: string, content: string) => {
    window.localStorage.setItem(
      NEWS_DRAFT_STORAGE_KEY,
      JSON.stringify({ title, content }),
    );
    router.push('/');
  };

  const createSingleNewsDraft = (item: AiNewsItem) => {
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
    const intro = briefs.length
      ? `过去 12 小时，AI 行业值得关注的焦点主要集中在：${briefs
          .slice(0, 3)
          .map((brief) => brief.title)
          .join('、')}。下面这份快讯，适合直接作为公众号行业简报的初稿。`
      : '以下为过去 12 小时内值得关注的 AI 行业中文热点快讯汇总。';

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
        .filter((item): item is AiNewsItem => item !== null);

      const normalizedBriefs = (data.briefs || [])
        .map((brief) => normalizeBrief(brief))
        .filter((brief): brief is AiNewsBrief => brief !== null);

      setItems(normalizedItems);
      setBriefs(normalizedBriefs);
      setGeneratedAt(data.generatedAt || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : '新闻抓取失败，请稍后重试。');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffdf9_0%,#f8f1ea_100%)] px-4 py-6 text-[#3a3029] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-[#eadfd3] bg-[linear-gradient(180deg,#fff8f3_0%,#ffffff_100%)] px-5 py-4 shadow-[0_18px_50px_rgba(214,181,154,0.22)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0e6] text-[#ef6b38]">
              <Newspaper size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#d77443]">
                AI Daily Wire
              </p>
              <p className="mt-1 text-sm text-[#7d7065]">
                仿公众号长文快讯版式的新闻生成页
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createDigestDraft}
              disabled={loading || refreshing || items.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[#efc6af] bg-[#ef6b38] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileUp size={16} />
              生成长文稿
            </button>
            <button
              type="button"
              onClick={() => void loadNews(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-[#eadfd3] bg-white px-4 py-2 text-sm font-medium text-[#5f534a] transition hover:bg-[#fff7f1] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
              {refreshing ? '刷新中...' : '刷新新闻'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,760px)] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-[30px] border border-[#eadfd3] bg-white p-5 shadow-[0_18px_50px_rgba(214,181,154,0.18)]">
              <div className="mb-4 flex items-center gap-2 text-[#d77443]">
                <Sparkles size={16} />
                <p className="text-xs uppercase tracking-[0.28em]">今日导读</p>
              </div>
              <h1 className="text-[28px] font-semibold leading-tight text-[#241b16]">
                过去 12 小时 AI 行业热点快讯
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#7d7065]">
                把最近半天内最值得关注的 AI 新闻，整理成接近公众号深夜快讯的阅读节奏。
                白天模式下依然保留窄栏排版、重点句前置和强节奏阅读体验，方便你一边筛新闻，一边直接出稿。
              </p>

              <div className="mt-5 space-y-3 border-t border-[#eee4da] pt-4 text-sm text-[#66584d]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#9b8d81]">新闻窗口</span>
                  <span>最近 12 小时</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#9b8d81]">中文优先</span>
                  <span>已开启</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#9b8d81]">最近抓取</span>
                  <span>{generatedAt ? formatDateTime(generatedAt) : '准备中'}</span>
                </div>
              </div>
            </section>

            {briefs.length > 0 && (
              <section className="rounded-[30px] border border-[#f1d7c7] bg-[linear-gradient(180deg,#fff6ef,rgba(255,255,255,0.96))] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[#d77443]">
                  快讯提要
                </p>
                <div className="mt-4 space-y-4">
                  {briefs.slice(0, 4).map((brief, index) => (
                    <div key={`${brief.title}-${index}`} className="border-l-2 border-[#ef6b38] pl-4">
                      <p className="text-sm font-medium leading-6 text-[#241b16]">
                        {brief.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#7d7065]">
                        {brief.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </aside>

          <main>
            {loading ? (
              <div className="rounded-[34px] border border-[#eadfd3] bg-white p-6 sm:p-8">
                <div className="mx-auto max-w-2xl animate-pulse space-y-6">
                  <div className="h-3 w-28 rounded bg-[#efe6dd]" />
                  <div className="h-10 w-4/5 rounded bg-[#efe6dd]" />
                  <div className="h-4 w-full rounded bg-[#f4ece4]" />
                  <div className="h-4 w-full rounded bg-[#f4ece4]" />
                  <div className="h-4 w-2/3 rounded bg-[#f4ece4]" />
                  <div className="h-px w-full bg-[#eee4da]" />
                  <div className="h-6 w-32 rounded bg-[#efe6dd]" />
                  <div className="h-4 w-full rounded bg-[#f4ece4]" />
                  <div className="h-4 w-11/12 rounded bg-[#f4ece4]" />
                  <div className="h-4 w-3/4 rounded bg-[#f4ece4]" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[34px] border border-[#f1c3c3] bg-[#fff4f4] p-8 text-[#9d4b4b]">
                <p className="text-lg font-medium text-[#8e3838]">新闻抓取失败</p>
                <p className="mt-3 text-sm leading-7">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[34px] border border-[#eadfd3] bg-white p-8 text-center">
                <p className="text-lg font-medium text-[#241b16]">
                  过去 12 小时内暂未抓取到符合条件的 AI 新闻
                </p>
                <p className="mt-3 text-sm leading-7 text-[#7d7065]">
                  可以稍后刷新，或者继续扩展新闻源与筛选规则。
                </p>
              </div>
            ) : (
              <article className="rounded-[36px] border border-[#eadfd3] bg-white shadow-[0_20px_70px_rgba(214,181,154,0.22)]">
                <div className="relative overflow-hidden border-b border-[#eee4da] px-6 py-6 sm:px-10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(239,107,56,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(240,211,190,0.22),transparent_32%)]" />
                  {items[0]?.imageUrl && (
                    <div className="absolute inset-0 opacity-20">
                      <img
                        src={items[0].imageUrl}
                        alt={items[0].title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-[#fff8f2]/75 to-white" />
                  <div className="relative">
                  <p className="text-xs uppercase tracking-[0.32em] text-[#d77443]">
                    AI 行业长文快讯
                  </p>
                  <h2 className="mt-4 text-[34px] font-semibold leading-tight text-[#241b16] sm:text-[42px]">
                    今夜 AI 行业有哪些新变化？
                  </h2>
                  <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#6f6258]">
                    我们把过去 12 小时内的 AI 热点新闻重新整理成一篇更适合公众号阅读的长文结构。
                    先给结论，再分主题展开，方便你快速浏览，也方便你直接改造成可发布内容。
                  </p>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-10">
                  {briefs.length > 0 && (
                    <section className="mb-10 rounded-[28px] border border-[#f1d7c7] bg-[#fff6ef] p-5 sm:p-6">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#d77443]">
                        开篇摘要
                      </p>
                      <div className="mt-5 space-y-4">
                        {briefs.slice(0, 3).map((brief, index) => (
                          <p
                            key={`${brief.title}-lead-${index}`}
                            className="border-l-2 border-[#ef6b38] pl-4 text-[15px] leading-8 text-[#5a4d43]"
                          >
                              <span className="font-medium text-[#241b16]">
                              {index + 1}. {brief.title}
                            </span>
                            <span className="text-[#7d7065]"> {brief.summary}</span>
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="space-y-10">
                    {items.map((item, index) => (
                      <section
                        key={`${item.link}-${index}`}
                        className="border-b border-dashed border-[#eee4da] pb-10 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 min-w-12 text-[24px] font-semibold leading-none text-[#ef6b38]">
                            {buildSectionLabel(index)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#8f8277]">
                              <span className="rounded-full border border-[#efc6af] bg-[#fff1e7] px-3 py-1 text-[#c96535]">
                                {item.source}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 size={13} />
                                {formatRelativeHours(item.publishedAt)}
                              </span>
                              <span>{formatDateTime(item.publishedAt)}</span>
                            </div>

                            <h3 className="text-[26px] font-semibold leading-[1.45] text-[#241b16]">
                              <span className="mr-2 align-middle text-[28px]">
                                {item.emoji}
                              </span>
                              {item.title}
                            </h3>

                            <p className="mt-4 text-[17px] leading-8 text-[#4b4037]">
                              {item.deck}
                            </p>

                            {item.imageUrl && (
                              <div className="mt-5 overflow-hidden rounded-[26px] border border-[#eadfd3] bg-[#fff8f2]">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="h-[260px] w-full object-cover"
                                />
                              </div>
                            )}

                            <p className="mt-5 text-[15px] leading-8 text-[#6f6258]">
                              {item.body}
                            </p>

                            <div className="mt-5 rounded-[22px] border border-[#f1d7c7] bg-[#fff6ef] p-4">
                              <p className="text-xs uppercase tracking-[0.24em] text-[#d77443]">
                                值得关注
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#735f50]">
                                {item.takeaway}
                              </p>
                            </div>

                            {item.summary && (
                              <p className="mt-5 border-l-2 border-[#eadfd3] pl-4 text-[14px] leading-7 text-[#8e8074]">
                                {item.summary}
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => createSingleNewsDraft(item)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#efc6af] bg-[#fff1e7] px-4 py-2 text-sm font-medium text-[#c96535] transition hover:bg-[#ffe8db]"
                              >
                                <FileUp size={16} />
                                转成长文稿件
                              </button>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-[#eadfd3] bg-white px-4 py-2 text-sm font-medium text-[#5c5046] transition hover:bg-[#fff7f1]"
                              >
                                <ExternalLink size={16} />
                                查看原文
                              </a>
                            </div>
                          </div>
                        </div>
                      </section>
                    ))}
                  </div>
                </div>
              </article>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
