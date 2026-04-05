import { describe, expect, test } from 'vitest';

import { AI_NEWS_SOURCES } from '@/lib/ai-news/sources';

describe('AI_NEWS_SOURCES', () => {
  test('纯中文国内源版本不再包含 Google News 和海外源', () => {
    const urls = AI_NEWS_SOURCES.map((source) => source.url);

    expect(urls.some((url) => url.includes('news.google.com'))).toBe(false);
    expect(urls.some((url) => url.includes('openai.com'))).toBe(false);
    expect(urls.some((url) => url.includes('blog.google'))).toBe(false);
    expect(urls.some((url) => url.includes('substack.com'))).toBe(false);
  });
});
