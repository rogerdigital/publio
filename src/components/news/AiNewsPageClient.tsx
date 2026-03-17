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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function formatRelativeHours(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) {
    const minutes = Math.max(1, Math.round(diffMs / (1000 * 60)));
    return `${minutes} 分钟前`;
  }

  return `${diffHours.toFixed(1)} 小时前`;
}

function buildSectionLabel(index: number) {
  return String(index + 1).padStart(2, '0');
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

      setItems(data.items);
      setBriefs(data.briefs || []);
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
    <div className="min-h-screen bg-[#151515] px-4 py-6 text-[#d9d3ca] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/8 bg-white/4 px-5 py-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0642b]/15 text-[#ff7a45]">
              <Newspaper size={18} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#ff9a67]">
                AI Daily Wire
              </p>
              <p className="mt-1 text-sm text-[#b5aea4]">
                仿公众号长文快讯版式的新闻生成页
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={createDigestDraft}
              disabled={loading || refreshing || items.length === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[#ff7a45]/50 bg-[#ff7a45] px-4 py-2 text-sm font-medium text-[#24150f] transition hover:bg-[#ff9064] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileUp size={16} />
              生成长文稿
            </button>
            <button
              type="button"
              onClick={() => void loadNews(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-medium text-[#efe6da] transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
              {refreshing ? '刷新中...' : '刷新新闻'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,760px)] lg:items-start">
          <aside className="space-y-5 lg:sticky lg:top-6">
            <section className="rounded-[30px] border border-white/8 bg-[#1d1c1a] p-5 shadow-[0_22px_60px_rgba(0,0,0,0.35)]">
              <div className="mb-4 flex items-center gap-2 text-[#ff9a67]">
                <Sparkles size={16} />
                <p className="text-xs uppercase tracking-[0.28em]">今日导读</p>
              </div>
              <h1 className="text-[28px] font-semibold leading-tight text-[#fff3e7]">
                过去 12 小时 AI 行业热点快讯
              </h1>
              <p className="mt-4 text-sm leading-7 text-[#b5aea4]">
                把最近半天内最值得关注的 AI 新闻，整理成接近公众号深夜快讯的阅读节奏。
                深色底、窄栏排版、重点句前置，方便你一边筛新闻，一边直接出稿。
              </p>

              <div className="mt-5 space-y-3 border-t border-white/8 pt-4 text-sm text-[#c6beb1]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#8f877d]">新闻窗口</span>
                  <span>最近 12 小时</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#8f877d]">中文优先</span>
                  <span>已开启</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[#8f877d]">最近抓取</span>
                  <span>{generatedAt ? formatDateTime(generatedAt) : '准备中'}</span>
                </div>
              </div>
            </section>

            {briefs.length > 0 && (
              <section className="rounded-[30px] border border-[#ff7a45]/20 bg-[linear-gradient(180deg,rgba(255,122,69,0.10),rgba(255,122,69,0.02))] p-5">
                <p className="text-xs uppercase tracking-[0.28em] text-[#ff9a67]">
                  快讯提要
                </p>
                <div className="mt-4 space-y-4">
                  {briefs.slice(0, 4).map((brief, index) => (
                    <div key={`${brief.title}-${index}`} className="border-l-2 border-[#ff7a45] pl-4">
                      <p className="text-sm font-medium leading-6 text-[#fff3e7]">
                        {brief.title}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-[#c8c0b5]">
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
              <div className="rounded-[34px] border border-white/8 bg-[#1b1a18] p-6 sm:p-8">
                <div className="mx-auto max-w-2xl animate-pulse space-y-6">
                  <div className="h-3 w-28 rounded bg-white/10" />
                  <div className="h-10 w-4/5 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/8" />
                  <div className="h-4 w-full rounded bg-white/8" />
                  <div className="h-4 w-2/3 rounded bg-white/8" />
                  <div className="h-px w-full bg-white/10" />
                  <div className="h-6 w-32 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/8" />
                  <div className="h-4 w-11/12 rounded bg-white/8" />
                  <div className="h-4 w-3/4 rounded bg-white/8" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[34px] border border-red-500/30 bg-[#241616] p-8 text-[#ffbeb1]">
                <p className="text-lg font-medium text-[#ffd8cf]">新闻抓取失败</p>
                <p className="mt-3 text-sm leading-7">{error}</p>
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-[34px] border border-white/8 bg-[#1b1a18] p-8 text-center">
                <p className="text-lg font-medium text-[#fff3e7]">
                  过去 12 小时内暂未抓取到符合条件的 AI 新闻
                </p>
                <p className="mt-3 text-sm leading-7 text-[#b5aea4]">
                  可以稍后刷新，或者继续扩展新闻源与筛选规则。
                </p>
              </div>
            ) : (
              <article className="rounded-[36px] border border-white/8 bg-[#1b1a18] shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
                <div className="relative overflow-hidden border-b border-white/8 px-6 py-6 sm:px-10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,122,69,0.24),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_32%)]" />
                  {items[0]?.imageUrl && (
                    <div className="absolute inset-0 opacity-20">
                      <img
                        src={items[0].imageUrl}
                        alt={items[0].title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-[#1b1a18]/55 to-[#1b1a18]" />
                  <div className="relative">
                  <p className="text-xs uppercase tracking-[0.32em] text-[#ff9a67]">
                    AI 行业长文快讯
                  </p>
                  <h2 className="mt-4 text-[34px] font-semibold leading-tight text-[#fff4e8] sm:text-[42px]">
                    今夜 AI 行业有哪些新变化？
                  </h2>
                  <p className="mt-5 max-w-2xl text-[15px] leading-8 text-[#c8c0b5]">
                    我们把过去 12 小时内的 AI 热点新闻重新整理成一篇更适合公众号阅读的长文结构。
                    先给结论，再分主题展开，方便你快速浏览，也方便你直接改造成可发布内容。
                  </p>
                  </div>
                </div>

                <div className="px-6 py-8 sm:px-10">
                  {briefs.length > 0 && (
                    <section className="mb-10 rounded-[28px] border border-[#ff7a45]/18 bg-[rgba(255,122,69,0.06)] p-5 sm:p-6">
                      <p className="text-xs uppercase tracking-[0.28em] text-[#ff9a67]">
                        开篇摘要
                      </p>
                      <div className="mt-5 space-y-4">
                        {briefs.slice(0, 3).map((brief, index) => (
                          <p
                            key={`${brief.title}-lead-${index}`}
                            className="border-l-2 border-[#ff7a45] pl-4 text-[15px] leading-8 text-[#e8dfd1]"
                          >
                            <span className="font-medium text-[#fff4e8]">
                              {index + 1}. {brief.title}
                            </span>
                            <span className="text-[#cfc6ba]"> {brief.summary}</span>
                          </p>
                        ))}
                      </div>
                    </section>
                  )}

                  <div className="space-y-10">
                    {items.map((item, index) => (
                      <section
                        key={`${item.link}-${index}`}
                        className="border-b border-dashed border-white/8 pb-10 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 min-w-12 text-[24px] font-semibold leading-none text-[#ff7a45]">
                            {buildSectionLabel(index)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[#9e968c]">
                              <span className="rounded-full border border-[#ff7a45]/30 bg-[#ff7a45]/10 px-3 py-1 text-[#ffb08a]">
                                {item.source}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <Clock3 size={13} />
                                {formatRelativeHours(item.publishedAt)}
                              </span>
                              <span>{formatDateTime(item.publishedAt)}</span>
                            </div>

                            <h3 className="text-[26px] font-semibold leading-[1.45] text-[#fff4e8]">
                              <span className="mr-2 align-middle text-[28px]">
                                {item.emoji}
                              </span>
                              {item.title}
                            </h3>

                            <p className="mt-4 text-[17px] leading-8 text-[#efe4d6]">
                              {item.deck}
                            </p>

                            {item.imageUrl && (
                              <div className="mt-5 overflow-hidden rounded-[26px] border border-white/8 bg-black/20">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="h-[260px] w-full object-cover"
                                />
                              </div>
                            )}

                            <p className="mt-5 text-[15px] leading-8 text-[#cbc2b6]">
                              {item.body}
                            </p>

                            <div className="mt-5 rounded-[22px] border border-[#ff7a45]/16 bg-[rgba(255,122,69,0.06)] p-4">
                              <p className="text-xs uppercase tracking-[0.24em] text-[#ff9a67]">
                                值得关注
                              </p>
                              <p className="mt-2 text-sm leading-7 text-[#d3c8bb]">
                                {item.takeaway}
                              </p>
                            </div>

                            {item.summary && (
                              <p className="mt-5 border-l-2 border-white/12 pl-4 text-[14px] leading-7 text-[#aa9f91]">
                                {item.summary}
                              </p>
                            )}

                            <div className="mt-5 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => createSingleNewsDraft(item)}
                                className="inline-flex items-center gap-2 rounded-full border border-[#ff7a45]/45 bg-[#ff7a45]/12 px-4 py-2 text-sm font-medium text-[#ffd8c7] transition hover:bg-[#ff7a45]/18"
                              >
                                <FileUp size={16} />
                                转成长文稿件
                              </button>
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#e7ddd1] transition hover:bg-white/10"
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
