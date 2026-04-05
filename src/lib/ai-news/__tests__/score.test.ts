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
          sourceWeight: 5,
          creatorWeight: 0,
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
          sourceWeight: 3,
          creatorWeight: 2,
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
        sourceWeight: 5,
        creatorWeight: 0,
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
    creatorSourceCount: overrides.creatorSourceCount ?? 1,
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

  test('重要性接近时，来自传播敏感源且原文带图的话题应获得更高优先级', () => {
    const creatorFriendly = scoreAiNewsCluster(
      createCluster({
        signals: [
          {
            id: 'qbitai',
            title: 'OpenAI 发布新模型 GPT-X',
            canonicalTitle: 'openai 发布 新 模型 gpt x',
            summary: '量子位跟进解读 OpenAI 新模型发布。',
            link: 'https://www.qbitai.com/2026/04/gpt-x',
            imageUrl: 'https://www.qbitai.com/images/gpt-x-cover.jpg',
            articleImageCount: 3,
            sourceName: '量子位',
            sourceType: 'community',
            sourceDomain: 'qbitai.com',
            publishedAt: '2026-04-05T08:10:00.000Z',
            fetchedAt: '2026-04-05T08:25:00.000Z',
            entityTokens: ['openai', 'gpt-x', '模型'],
            topicTags: ['模型与产品发布'],
            isOfficialSource: false,
            sourceWeight: 4,
            creatorWeight: 5,
          },
        ],
        primarySignal: {
          id: 'qbitai',
          title: 'OpenAI 发布新模型 GPT-X',
          canonicalTitle: 'openai 发布 新 模型 gpt x',
          summary: '量子位跟进解读 OpenAI 新模型发布。',
          link: 'https://www.qbitai.com/2026/04/gpt-x',
          imageUrl: 'https://www.qbitai.com/images/gpt-x-cover.jpg',
          articleImageCount: 3,
          sourceName: '量子位',
          sourceType: 'community',
          sourceDomain: 'qbitai.com',
          publishedAt: '2026-04-05T08:10:00.000Z',
          fetchedAt: '2026-04-05T08:25:00.000Z',
          entityTokens: ['openai', 'gpt-x', '模型'],
          topicTags: ['模型与产品发布'],
          isOfficialSource: false,
          sourceWeight: 4,
          creatorWeight: 5,
        },
        officialSourceCount: 0,
        mediaSourceCount: 0,
      }),
      new Date('2026-04-05T10:00:00.000Z'),
    );

    const plainSignal = scoreAiNewsCluster(
      createCluster({
        signals: [
          {
            id: 'plain',
            title: 'OpenAI 发布新模型 GPT-X',
            canonicalTitle: 'openai 发布 新 模型 gpt x',
            summary: '某通用媒体转载发布消息。',
            link: 'https://example.com/news/gpt-x',
            sourceName: 'Example News',
            sourceType: 'media',
            sourceDomain: 'example.com',
            publishedAt: '2026-04-05T08:10:00.000Z',
            fetchedAt: '2026-04-05T08:25:00.000Z',
            entityTokens: ['openai', 'gpt-x', '模型'],
            topicTags: ['模型与产品发布'],
            isOfficialSource: false,
            sourceWeight: 1,
            creatorWeight: 0,
          },
        ],
        primarySignal: {
          id: 'plain',
          title: 'OpenAI 发布新模型 GPT-X',
          canonicalTitle: 'openai 发布 新 模型 gpt x',
          summary: '某通用媒体转载发布消息。',
          link: 'https://example.com/news/gpt-x',
          sourceName: 'Example News',
          sourceType: 'media',
          sourceDomain: 'example.com',
          publishedAt: '2026-04-05T08:10:00.000Z',
          fetchedAt: '2026-04-05T08:25:00.000Z',
          entityTokens: ['openai', 'gpt-x', '模型'],
          topicTags: ['模型与产品发布'],
          isOfficialSource: false,
          sourceWeight: 1,
          creatorWeight: 0,
        },
        officialSourceCount: 0,
        mediaSourceCount: 1,
      }),
      new Date('2026-04-05T10:00:00.000Z'),
    );

    expect(creatorFriendly.scores.creatorFit).toBeGreaterThan(
      plainSignal.scores.creatorFit,
    );
    expect(creatorFriendly.scores.visualReadiness).toBeGreaterThan(
      plainSignal.scores.visualReadiness,
    );
    expect(creatorFriendly.totalScore).toBeGreaterThan(plainSignal.totalScore);
  });
});
