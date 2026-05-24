import { TwitterApi } from 'twitter-api-v2';
import { getXConfig } from '@/lib/config';
import { logger } from '@/lib/logger';
import { extractEntityTokens, inferTopicTags } from '@/lib/ai-news/normalize';
import type { NormalizedAiNewsSignal, AiNewsSourceType } from '@/lib/ai-news/types';

interface KolAccount {
  handle: string;
  name: string;
  weight: number;
  sourceType: AiNewsSourceType;
}

const KOL_ACCOUNTS: KolAccount[] = [
  { handle: 'OpenAI', name: 'OpenAI', weight: 5, sourceType: 'official' },
  { handle: 'AnthropicAI', name: 'Anthropic', weight: 5, sourceType: 'official' },
  { handle: 'GoogleDeepMind', name: 'DeepMind', weight: 5, sourceType: 'official' },
  { handle: 'ylecun', name: 'Yann LeCun', weight: 4, sourceType: 'community' },
  { handle: 'AndrewYNg', name: 'Andrew Ng', weight: 4, sourceType: 'community' },
  { handle: 'DrJimFan', name: 'Jim Fan', weight: 4, sourceType: 'community' },
  { handle: 'karpathy', name: 'Andrej Karpathy', weight: 4, sourceType: 'community' },
  { handle: 'goodfellow_ian', name: 'Ian Goodfellow', weight: 4, sourceType: 'community' },
  { handle: 'sama', name: 'Sam Altman', weight: 5, sourceType: 'official' },
  { handle: 'GoogleAI', name: 'Google AI', weight: 5, sourceType: 'official' },
];

function hashId(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `x-${Math.abs(hash).toString(36)}`;
}

export async function fetchXSignals(hours = 24): Promise<NormalizedAiNewsSignal[]> {
  const config = getXConfig();
  if (!config.apiKey || !config.apiSecret || !config.accessToken || !config.accessTokenSecret) {
    return [];
  }

  const client = new TwitterApi({
    appKey: config.apiKey,
    appSecret: config.apiSecret,
    accessToken: config.accessToken,
    accessSecret: config.accessTokenSecret,
  });

  const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
  const fetchedAt = new Date().toISOString();
  const signals: NormalizedAiNewsSignal[] = [];

  const results = await Promise.allSettled(
    KOL_ACCOUNTS.map(async (account) => {
      try {
        const user = await client.v2.userByUsername(account.handle);
        if (!user.data?.id) return;

        const timeline = await client.v2.userTimeline(user.data.id, {
          max_results: 10,
          exclude: ['replies', 'retweets'],
          'tweet.fields': ['created_at', 'text'],
        });

        for (const tweet of timeline.tweets ?? []) {
          const publishedAt = new Date(tweet.created_at!).toISOString();
          if (Date.parse(publishedAt) < cutoffTime) continue;

          const text = tweet.text ?? '';
          if (text.length < 20) continue;

          signals.push({
            id: hashId(tweet.id),
            title: text.slice(0, 100).replace(/\n/g, ' '),
            canonicalTitle: text.slice(0, 80).toLowerCase().replace(/\n/g, ' '),
            summary: text,
            link: `https://x.com/${account.handle}/status/${tweet.id}`,
            sourceWeight: account.weight,
            sourceName: account.name,
            sourceType: 'x' as AiNewsSourceType,
            sourceDomain: 'x.com',
            publishedAt,
            fetchedAt,
            entityTokens: extractEntityTokens(text.slice(0, 100), ''),
            topicTags: inferTopicTags(text.slice(0, 100), ''),
            isOfficialSource: account.sourceType === 'official',
          });
        }
      } catch (err) {
        logger.warn(
          `X fetch failed for @${account.handle}: ${err instanceof Error ? err.message : err}`,
        );
      }
    }),
  );

  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    logger.warn(`X source: ${failed}/${KOL_ACCOUNTS.length} accounts failed`);
  }

  return signals;
}
