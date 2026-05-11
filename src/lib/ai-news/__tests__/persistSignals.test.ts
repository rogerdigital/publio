import { beforeEach, describe, expect, test } from 'vitest';

import { convertToSignalInput, persistSignalsFromDesk } from '@/lib/ai-news/persistSignals';
import { resetSignalRegistryForTests, getSignalRegistry } from '@/lib/signals/registry';
import type { NormalizedAiNewsSignal } from '@/lib/ai-news/types';

function makeFakeSignal(overrides: Partial<NormalizedAiNewsSignal> = {}): NormalizedAiNewsSignal {
  return {
    id: 'ns-1',
    title: 'AI breakthrough',
    canonicalTitle: 'ai breakthrough',
    summary: 'Major progress in AI',
    link: 'https://example.com/article-1',
    sourceWeight: 5,
    sourceName: 'TechNews',
    sourceType: 'media',
    sourceDomain: 'technews.com',
    publishedAt: '2026-05-09T10:00:00.000Z',
    fetchedAt: '2026-05-10T01:00:00.000Z',
    entityTokens: ['AI'],
    topicTags: ['ai', 'tech'],
    isOfficialSource: false,
    ...overrides,
  };
}

describe('persistSignalsFromDesk', () => {
  beforeEach(() => {
    resetSignalRegistryForTests({
      now: () => '2026-05-10T01:00:00.000Z',
    });
  });

  test('converts NormalizedAiNewsSignal to CreateSignalInput correctly', () => {
    const input = convertToSignalInput(makeFakeSignal());

    expect(input).toMatchObject({
      sourceId: 'technews.com',
      sourceType: 'rss',
      title: 'AI breakthrough',
      summary: 'Major progress in AI',
      url: 'https://example.com/article-1',
      author: 'TechNews',
      publishedAt: '2026-05-09T10:00:00.000Z',
      tags: ['ai', 'tech'],
    });
    expect(input.score?.credibility).toBe(0.5);
  });

  test('persists signals and returns their ids', () => {
    const signals = [
      makeFakeSignal({ id: 'ns-1', link: 'https://example.com/a' }),
      makeFakeSignal({ id: 'ns-2', title: 'Another one', link: 'https://example.com/b' }),
    ];

    const ids = persistSignalsFromDesk(signals);

    expect(ids).toHaveLength(2);
    const registry = getSignalRegistry();
    expect(registry.listSignals()).toHaveLength(2);
  });

  test('deduplicates on repeated calls', () => {
    const signals = [makeFakeSignal({ id: 'ns-1', link: 'https://example.com/same-url' })];

    persistSignalsFromDesk(signals);
    persistSignalsFromDesk(signals);

    const registry = getSignalRegistry();
    expect(registry.listSignals()).toHaveLength(1);
  });

  test('deduplicates by title + sourceId when no url', () => {
    const signals = [
      makeFakeSignal({ id: 'ns-1', title: 'Same Title', link: '', sourceDomain: 'src.com' }),
    ];

    persistSignalsFromDesk(signals);
    persistSignalsFromDesk(signals);

    const registry = getSignalRegistry();
    expect(registry.listSignals()).toHaveLength(1);
  });

  test('caps credibility score at 1.0', () => {
    const input = convertToSignalInput(makeFakeSignal({ sourceWeight: 15 }));
    expect(input.score?.credibility).toBe(1);
  });
});
