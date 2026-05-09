import { TwitterApi } from 'twitter-api-v2';
import { getXConfig, getWechatConfig } from '@/lib/config';
import type { PlatformId } from '@/types';

export interface FetchedMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  fetchedAt: string;
}

/**
 * Fetch public metrics for a tweet using twitter-api-v2.
 * URL format: https://x.com/i/status/{tweetId} or https://x.com/user/status/{tweetId}
 */
export async function fetchXMetrics(tweetId: string): Promise<FetchedMetrics> {
  const config = getXConfig();
  if (!config) throw new Error('X API not configured');

  const client = new TwitterApi({
    appKey: config.apiKey,
    appSecret: config.apiSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessTokenSecret,
  });

  const tweet = await client.v2.singleTweet(tweetId, {
    'tweet.fields': ['public_metrics'],
  });

  const metrics = tweet.data.public_metrics;
  return {
    views: metrics?.impression_count ?? 0,
    likes: metrics?.like_count ?? 0,
    comments: metrics?.reply_count ?? 0,
    shares: (metrics?.retweet_count ?? 0) + (metrics?.quote_count ?? 0),
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetch article metrics from WeChat MP API.
 * Uses the datacube/article/summary endpoint with media_id extracted from receipt.
 * Note: WeChat MP API has limitations — article-level metrics require media_id
 * and are only available via the analytics API which returns daily summaries.
 */
export async function fetchWechatMetrics(mediaId: string): Promise<FetchedMetrics> {
  const config = getWechatConfig();
  if (!config) throw new Error('WeChat API not configured');

  const tokenRes = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`,
  );
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token as string;

  if (!accessToken) {
    throw new Error('Failed to get WeChat access token');
  }

  // Get article summary — WeChat returns daily stats for articles published in last 7 days
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split('T')[0];

  const res = await fetch(
    `https://api.weixin.qq.com/datacube/getarticlesummary?access_token=${accessToken}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ begin_date: dateStr, end_date: dateStr }),
    },
  );
  const data = await res.json();

  const article = (
    data.list as Array<
      {
        title: string;
        details_page_uv: number;
        int_page_read_count: number;
        ori_page_read_count: number;
        share_count: number;
        share_uv: number;
      }[]
    >
  )
    ?.flatMap((item) => item)
    ?.find((a) => a.title?.includes(mediaId));

  return {
    views: article?.int_page_read_count ?? 0,
    likes: 0, // WeChat doesn't expose likes via this API
    comments: 0, // WeChat comments require separate API
    shares: article?.share_count ?? 0,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Extract platform-specific content ID from a URL.
 */
export function extractPlatformId(platform: PlatformId, url: string): string | null {
  if (platform === 'x') {
    const match = url.match(/\/status\/(\d+)/);
    return match?.[1] ?? null;
  }
  if (platform === 'wechat') {
    // WeChat receipts use generic URL, return empty (metrics by media_id not URL)
    return null;
  }
  return null;
}

type MetricsFetcher = (id: string) => Promise<FetchedMetrics>;

export const PLATFORM_FETCHERS: Partial<Record<PlatformId, MetricsFetcher>> = {
  x: fetchXMetrics,
  // wechat: fetchWechatMetrics — disabled until proper media_id tracking
  // xiaohongshu: not supported
  // zhihu: not supported
};
