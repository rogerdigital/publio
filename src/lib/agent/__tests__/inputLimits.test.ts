import { describe, expect, test } from 'vitest';

import {
  AGENT_INPUT_LIMITS,
  limitChatMessages,
  limitRecommendationClusters,
  limitResearchSignals,
  limitText,
  markTruncated,
} from '@/lib/agent/inputLimits';
import type { AiNewsCluster, NormalizedAiNewsSignal } from '@/lib/ai-news/types';

function createSignal(overrides: Partial<NormalizedAiNewsSignal> = {}): NormalizedAiNewsSignal {
  return {
    id: 'signal-1',
    title: 'signal title',
    canonicalTitle: 'signal title',
    summary: 'summary',
    link: 'https://example.com',
    sourceWeight: 1,
    sourceName: 'Source',
    sourceType: 'media',
    sourceDomain: 'example.com',
    publishedAt: '2026-05-09T00:00:00.000Z',
    fetchedAt: '2026-05-09T00:00:00.000Z',
    entityTokens: [],
    topicTags: [],
    isOfficialSource: false,
    ...overrides,
  };
}

function createCluster(index: number, signals: NormalizedAiNewsSignal[] = []): AiNewsCluster {
  const primarySignal = signals[0] ?? createSignal({ id: `signal-${index}` });
  return {
    clusterId: `cluster-${index}`,
    title: `cluster ${index}`,
    normalizedTitle: `cluster ${index}`,
    topicTags: [],
    entityTokens: [],
    signals: signals.length ? signals : [primarySignal],
    primarySignal,
    earliestPublishedAt: '2026-05-09T00:00:00.000Z',
    latestPublishedAt: '2026-05-09T00:00:00.000Z',
    coverageCount: 1,
    officialSourceCount: 0,
    mediaSourceCount: 1,
  };
}

describe('agent input limits', () => {
  test('limits text by character count', () => {
    const result = limitText('abcdef', 3);

    expect(result).toEqual({ value: 'abc', truncated: true });
  });

  test('keeps only recent chat messages and trims message content', () => {
    const messages = Array.from({ length: AGENT_INPUT_LIMITS.chatMessages + 2 }, (_, index) => ({
      role: index % 2 === 0 ? ('user' as const) : ('assistant' as const),
      content: index === AGENT_INPUT_LIMITS.chatMessages + 1 ? 'x'.repeat(5_000) : `msg-${index}`,
    }));

    const result = limitChatMessages(messages);

    expect(result.truncated).toBe(true);
    expect(result.value).toHaveLength(AGENT_INPUT_LIMITS.chatMessages);
    expect(result.value[0].content).toBe('msg-2');
    expect(result.value.at(-1)?.content).toHaveLength(AGENT_INPUT_LIMITS.chatMessageChars);
  });

  test('limits research signal count and field length', () => {
    const signals = Array.from({ length: AGENT_INPUT_LIMITS.researchSignals + 1 }, (_, index) => ({
      title: index === 0 ? 't'.repeat(500) : `title-${index}`,
      summary: 's'.repeat(2_000),
      source: 'source',
    }));

    const result = limitResearchSignals(signals);

    expect(result.truncated).toBe(true);
    expect(result.value).toHaveLength(AGENT_INPUT_LIMITS.researchSignals);
    expect(result.value[0].title).toHaveLength(AGENT_INPUT_LIMITS.signalTitleChars);
    expect(result.value[0].summary).toHaveLength(AGENT_INPUT_LIMITS.signalSummaryChars);
  });

  test('limits recommendation clusters and nested signal source names', () => {
    const clusters = Array.from(
      { length: AGENT_INPUT_LIMITS.recommendationClusters + 1 },
      (_, index) =>
        createCluster(
          index,
          Array.from({ length: AGENT_INPUT_LIMITS.clusterSignals + 1 }, (_, signalIndex) =>
            createSignal({
              id: `signal-${index}-${signalIndex}`,
              sourceName: 'source'.repeat(50),
            }),
          ),
        ),
    );

    const result = limitRecommendationClusters(clusters);

    expect(result.truncated).toBe(true);
    expect(result.value).toHaveLength(AGENT_INPUT_LIMITS.recommendationClusters);
    expect(result.value[0].signals).toHaveLength(AGENT_INPUT_LIMITS.clusterSignals);
    expect(result.value[0].signals[0].sourceName).toHaveLength(
      AGENT_INPUT_LIMITS.signalSourceChars,
    );
  });

  test('marks truncated responses with a header', () => {
    const response = markTruncated(new Response('ok'), true);

    expect(response.headers.get('X-Agent-Input-Truncated')).toBe('true');
  });
});
