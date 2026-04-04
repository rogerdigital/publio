import { describe, expect, test } from 'vitest';

import {
  scoreAiNewsCluster,
  type AiNewsCluster,
} from '@/lib/ai-news/score';

function createCluster(overrides: Partial<AiNewsCluster>): AiNewsCluster {
  return {
    clusterId: overrides.clusterId ?? 'cluster-1',
    title: overrides.title ?? 'OpenAI 发布新模型 GPT-X',
    normalizedTitle: overrides.normalizedTitle ?? 'openai 发布 新 模型 gpt x',
    topicTags: overrides.topicTags ?? ['模型与产品发布'],
    entityTokens: overrides.entityTokens ?? ['openai', 'gpt-x', '模型'],
    signals:
      overrides.signals ??
      [
        {
          id: 'official',
          title: 'OpenAI 发布新模型 GPT-X',
          canonicalTitle: 'openai 发布 新 模型 gpt x',
          summary: 'OpenAI 官方公布 GPT-X 并开放企业接入。',
          link: 'https://openai.com/blog/gpt-x',
          sourceName: 'OpenAI',
          sourceType: 'official',
          sourceDomain: 'openai.com',
          publishedAt: '2026-04-05T08:00:00.000Z',
          fetchedAt: '2026-04-05T08:20:00.000Z',
          entityTokens: ['openai', 'gpt-x', '模型'],
          topicTags: ['模型与产品发布'],
          isOfficialSource: true,
        },
        {
          id: 'media',
          title: 'OpenAI 推出 GPT-X，新模型面向企业开放',
          canonicalTitle: 'openai 推出 gpt x 新 模型 面向 企业 开放',
          summary: '多家媒体跟进报道 OpenAI 新模型发布。',
          link: 'https://36kr.com/p/123',
          sourceName: '36氪',
          sourceType: 'media',
          sourceDomain: '36kr.com',
          publishedAt: '2026-04-05T08:10:00.000Z',
          fetchedAt: '2026-04-05T08:25:00.000Z',
          entityTokens: ['openai', 'gpt-x', '模型'],
          topicTags: ['模型与产品发布'],
          isOfficialSource: false,
        },
      ],
    primarySignal: overrides.primarySignal ??
      {
        id: 'official',
        title: 'OpenAI 发布新模型 GPT-X',
        canonicalTitle: 'openai 发布 新 模型 gpt x',
        summary: 'OpenAI 官方公布 GPT-X 并开放企业接入。',
        link: 'https://openai.com/blog/gpt-x',
        sourceName: 'OpenAI',
        sourceType: 'official',
        sourceDomain: 'openai.com',
        publishedAt: '2026-04-05T08:00:00.000Z',
        fetchedAt: '2026-04-05T08:20:00.000Z',
        entityTokens: ['openai', 'gpt-x', '模型'],
        topicTags: ['模型与产品发布'],
        isOfficialSource: true,
      },
    earliestPublishedAt: overrides.earliestPublishedAt ?? '2026-04-05T08:00:00.000Z',
    latestPublishedAt: overrides.latestPublishedAt ?? '2026-04-05T08:10:00.000Z',
    coverageCount: overrides.coverageCount ?? 2,
    officialSourceCount: overrides.officialSourceCount ?? 1,
    mediaSourceCount: overrides.mediaSourceCount ?? 1,
  };
}

describe('scoreAiNewsCluster', () => {
  test('给高可信、较新且覆盖度高的话题更高综合分', () => {
    const scored = scoreAiNewsCluster(
      createCluster({}),
      new Date('2026-04-05T10:00:00.000Z'),
    );

    expect(scored.scores.freshness).toBeGreaterThanOrEqual(80);
    expect(scored.scores.credibility).toBeGreaterThanOrEqual(80);
    expect(scored.totalScore).toBeGreaterThanOrEqual(75);
    expect(scored.bucket).toBe('today');
  });

  test('较旧但仍有影响的话题会进入还能追分层', () => {
    const scored = scoreAiNewsCluster(
      createCluster({
        latestPublishedAt: '2026-04-02T09:00:00.000Z',
        earliestPublishedAt: '2026-04-02T08:00:00.000Z',
      }),
      new Date('2026-04-05T10:00:00.000Z'),
    );

    expect(scored.scores.freshness).toBeLessThan(50);
    expect(scored.totalScore).toBeGreaterThan(0);
    expect(scored.bucket).toBe('follow');
  });
});
