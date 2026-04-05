import { describe, expect, test } from 'vitest';

import {
  buildResearchBrief,
  type ScoredAiNewsCluster,
} from '@/lib/ai-news/research';

function createScoredCluster(overrides: Partial<ScoredAiNewsCluster>): ScoredAiNewsCluster {
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
      ],
    primarySignal:
      overrides.primarySignal ??
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
    scores:
      overrides.scores ?? {
        freshness: 88,
        impact: 84,
        momentum: 79,
        credibility: 92,
      },
    totalScore: overrides.totalScore ?? 86,
    bucket: overrides.bucket ?? 'today',
  };
}

describe('buildResearchBrief', () => {
  test('生成固定结构的研究底稿，优先解释为什么重要和影响了谁', () => {
    const brief = buildResearchBrief(createScoredCluster({}));

    expect(brief.whatHappened).toContain('OpenAI');
    expect(brief.whyItMatters.length).toBeGreaterThan(0);
    expect(brief.whoIsAffected.length).toBeGreaterThan(0);
    expect(brief.recommendedAngles.length).toBeGreaterThan(1);
    expect(brief.evidence[0].label).toContain('OpenAI');
  });

  test('优先继承主信号中的原文配图到研究底稿', () => {
    const brief = buildResearchBrief(
      createScoredCluster({
        signals: [
          {
            id: 'official',
            title: 'OpenAI 发布新模型 GPT-X',
            canonicalTitle: 'openai 发布 新 模型 gpt x',
            summary: 'OpenAI 官方公布 GPT-X 并开放企业接入。',
            link: 'https://openai.com/blog/gpt-x',
            imageUrl: 'https://openai.com/images/gpt-x-cover.jpg',
            sourceName: 'OpenAI',
            sourceType: 'official',
            sourceDomain: 'openai.com',
            publishedAt: '2026-04-05T08:00:00.000Z',
            fetchedAt: '2026-04-05T08:20:00.000Z',
            entityTokens: ['openai', 'gpt-x', '模型'],
            topicTags: ['模型与产品发布'],
            isOfficialSource: true,
          },
        ],
        primarySignal: {
          id: 'official',
          title: 'OpenAI 发布新模型 GPT-X',
          canonicalTitle: 'openai 发布 新 模型 gpt x',
          summary: 'OpenAI 官方公布 GPT-X 并开放企业接入。',
          link: 'https://openai.com/blog/gpt-x',
          imageUrl: 'https://openai.com/images/gpt-x-cover.jpg',
          sourceName: 'OpenAI',
          sourceType: 'official',
          sourceDomain: 'openai.com',
          publishedAt: '2026-04-05T08:00:00.000Z',
          fetchedAt: '2026-04-05T08:20:00.000Z',
          entityTokens: ['openai', 'gpt-x', '模型'],
          topicTags: ['模型与产品发布'],
          isOfficialSource: true,
        },
      }),
    );

    expect(brief.imageUrl).toBe('https://openai.com/images/gpt-x-cover.jpg');
    expect(brief.evidence[0].imageUrl).toBe('https://openai.com/images/gpt-x-cover.jpg');
  });
});
