import { describe, expect, test } from 'vitest';

import { AI_NEWS_SOURCES } from '@/lib/ai-news/sources';

describe('AI_NEWS_SOURCES', () => {
  test('精选 RSS 源保留 Import AI，但不包含 Google News 和官方博客源', () => {
    const urls = AI_NEWS_SOURCES.map((source) => source.url);
    const names = AI_NEWS_SOURCES.map((source) => source.name);

    expect(names).toContain('Import AI');
    expect(urls.some((url) => url.includes('importai.substack.com'))).toBe(true);
    expect(urls.some((url) => url.includes('news.google.com'))).toBe(false);
    expect(urls.some((url) => url.includes('openai.com'))).toBe(false);
    expect(urls.some((url) => url.includes('blog.google'))).toBe(false);
  });
});
