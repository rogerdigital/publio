// @vitest-environment node

import { describe, expect, it, vi } from 'vitest';

const mockSingleTweet = vi.fn().mockResolvedValue({
  data: {
    public_metrics: {
      impression_count: 100,
      like_count: 10,
      reply_count: 5,
      retweet_count: 3,
      quote_count: 2,
    },
  },
});

vi.mock('twitter-api-v2', () => ({
  TwitterApi: class {
    v2 = { singleTweet: mockSingleTweet };
  },
}));

vi.mock('@/lib/config', () => ({
  getXConfig: () => ({
    apiKey: 'test',
    apiSecret: 'test',
    accessToken: 'test',
    accessTokenSecret: 'test',
  }),
  getWechatConfig: () => null,
}));

import { fetchXMetrics, extractPlatformId } from '../fetchers';

describe('metrics/fetchers', () => {
  it('extracts tweet ID from x.com URL', () => {
    expect(extractPlatformId('x', 'https://x.com/user/status/1234567890')).toBe('1234567890');
    expect(extractPlatformId('x', 'https://x.com/i/status/9876543210')).toBe('9876543210');
  });

  it('returns null for non-x platform', () => {
    expect(extractPlatformId('wechat', 'https://mp.weixin.qq.com')).toBeNull();
    expect(extractPlatformId('xiaohongshu', 'https://xiaohongshu.com')).toBeNull();
  });

  it('returns null for URL without status ID', () => {
    expect(extractPlatformId('x', 'https://x.com/user')).toBeNull();
  });

  it('fetches X metrics', async () => {
    const metrics = await fetchXMetrics('1234567890');
    expect(metrics.views).toBe(100);
    expect(metrics.likes).toBe(10);
    expect(metrics.comments).toBe(5);
    expect(metrics.shares).toBe(5); // retweet + quote
    expect(metrics.fetchedAt).toBeTruthy();
  });
});
