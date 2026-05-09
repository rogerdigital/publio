import { afterEach, describe, expect, test, vi } from 'vitest';

import { XiaohongshuPublisher } from '@/lib/publishers/xiaohongshu';
import { ZhihuPublisher } from '@/lib/publishers/zhihu';

describe('platform-specific publish payloads', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  test('sends markdown image URLs in Xiaohongshu image note payloads', async () => {
    vi.stubEnv('XHS_APP_ID', 'app-id');
    vi.stubEnv('XHS_APP_SECRET', 'app-secret');
    vi.stubEnv('XHS_ACCESS_TOKEN', 'token');
    const fetch = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          code: 0,
          data: { note_url: 'https://www.xiaohongshu.com/explore/1' },
        }),
    });
    vi.stubGlobal('fetch', fetch);

    const result = await new XiaohongshuPublisher().publish({
      title: '小红书标题',
      markdownContent: '正文\n\n![cover](https://cdn.example.com/cover.png)',
      htmlContent: '',
    });

    expect(result.success).toBe(true);
    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as {
      note_type: string;
      image_urls: string[];
    };
    expect(body.note_type).toBe('image');
    expect(body.image_urls).toEqual(['https://cdn.example.com/cover.png']);
  });

  test('sends Zhihu column and topic tokens when configured', async () => {
    vi.stubEnv('ZHIHU_COOKIE', 'z_c0=token');
    vi.stubEnv('ZHIHU_COLUMN_TOKEN', 'column-1');
    vi.stubEnv('ZHIHU_TOPIC_TOKENS', 'topic-a, topic-b');
    const fetch = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('/api/articles/drafts')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ id: 'draft-1' }),
        });
      }
      return Promise.resolve({ ok: true, status: 200 });
    });
    vi.stubGlobal('fetch', fetch);

    const result = await new ZhihuPublisher().publish({
      title: '知乎标题',
      markdownContent: '正文',
      htmlContent: '<p>正文</p>',
    });

    expect(result.success).toBe(true);
    const [, updateInit] = fetch.mock.calls[1] as [string, RequestInit];
    const updateBody = JSON.parse(String(updateInit.body)) as {
      column_url_token: string;
      topic_url_tokens: string[];
    };
    expect(updateBody.column_url_token).toBe('column-1');
    expect(updateBody.topic_url_tokens).toEqual(['topic-a', 'topic-b']);

    const [, publishInit] = fetch.mock.calls[2] as [string, RequestInit];
    const publishBody = JSON.parse(String(publishInit.body)) as {
      column: { url_token: string };
    };
    expect(publishBody.column).toEqual({ url_token: 'column-1' });
  }, 10_000);
});
