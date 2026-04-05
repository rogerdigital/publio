import { describe, expect, test } from 'vitest';

import {
  clusterAiNewsSignals,
  type NormalizedAiNewsSignal,
} from '@/lib/ai-news/cluster';

function createSignal(overrides: Partial<NormalizedAiNewsSignal>): NormalizedAiNewsSignal {
  return {
    id: overrides.id ?? `signal-${Math.random().toString(36).slice(2)}`,
    title: overrides.title ?? 'OpenAI 发布新模型',
    canonicalTitle: overrides.canonicalTitle ?? 'openai 发布 新 模型',
    summary: overrides.summary ?? '官方公布新模型并开放 API。',
    link: overrides.link ?? 'https://example.com/news',
    sourceWeight: overrides.sourceWeight ?? 1,
    creatorWeight: overrides.creatorWeight ?? 0,
    sourceName: overrides.sourceName ?? 'Example News',
    sourceType: overrides.sourceType ?? 'media',
    sourceDomain: overrides.sourceDomain ?? 'example.com',
    publishedAt: overrides.publishedAt ?? '2026-04-05T08:00:00.000Z',
    fetchedAt: overrides.fetchedAt ?? '2026-04-05T08:30:00.000Z',
    entityTokens: overrides.entityTokens ?? ['openai', '模型'],
    topicTags: overrides.topicTags ?? ['模型与产品发布'],
    isOfficialSource: overrides.isOfficialSource ?? false,
  };
}

describe('clusterAiNewsSignals', () => {
  test('会把同一事件的多来源报道聚成一个候选题簇', () => {
    const clusters = clusterAiNewsSignals([
      createSignal({
        id: 'official',
        title: 'OpenAI 发布新模型 GPT-X',
        canonicalTitle: 'openai 发布 新 模型 gpt x',
        summary: 'OpenAI 官方公布 GPT-X 并开放企业接入。',
        sourceName: 'OpenAI',
        sourceType: 'official',
        sourceDomain: 'openai.com',
        link: 'https://openai.com/blog/gpt-x',
        isOfficialSource: true,
      }),
      createSignal({
        id: 'media',
        title: 'OpenAI 推出 GPT-X，新模型面向企业开放',
        canonicalTitle: 'openai 推出 gpt x 新 模型 面向 企业 开放',
        summary: '多家媒体跟进报道 OpenAI 新模型发布。',
        sourceName: '36氪',
        sourceType: 'media',
        sourceDomain: '36kr.com',
        link: 'https://36kr.com/p/123',
      }),
    ]);

    expect(clusters).toHaveLength(1);
    expect(clusters[0].signals).toHaveLength(2);
    expect(clusters[0].primarySignal.id).toBe('official');
    expect(clusters[0].coverageCount).toBe(2);
    expect(clusters[0].creatorSourceCount).toBe(0);
  });

  test('会把不同事件保留为独立候选题', () => {
    const clusters = clusterAiNewsSignals([
      createSignal({
        id: 'openai-launch',
        title: 'OpenAI 发布新模型 GPT-X',
        canonicalTitle: 'openai 发布 新 模型 gpt x',
      }),
      createSignal({
        id: 'nvidia-chip',
        title: '英伟达公布新一代 AI 芯片路线图',
        canonicalTitle: '英伟达 公布 新一代 ai 芯片 路线图',
        summary: '芯片供给与算力价格成为市场关注点。',
        link: 'https://example.com/chip',
        entityTokens: ['英伟达', '芯片', '算力'],
        topicTags: ['算力与芯片'],
      }),
    ]);

    expect(clusters).toHaveLength(2);
  });
});
