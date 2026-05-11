import { describe, expect, test, beforeEach } from 'vitest';
import { buildWritingAgentContext, formatContextForPrompt } from '@/lib/agent/context';
import { getBriefRegistry, resetBriefRegistryForTests } from '@/lib/briefs/registry';
import { resetTopicRegistryForTests } from '@/lib/topics/registry';

describe('buildWritingAgentContext', () => {
  let topicStore: ReturnType<typeof resetTopicRegistryForTests>;

  beforeEach(() => {
    topicStore = resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    resetBriefRegistryForTests({
      createId: () => 'brief-1',
      now: () => '2026-05-10T01:00:00.000Z',
      topicLookup: topicStore,
    });
  });

  test('returns null when no brief exists', () => {
    topicStore.createTopic({ title: '选题' });
    const ctx = buildWritingAgentContext({ topicId: 'topic-1' });
    expect(ctx).toBeNull();
  });

  test('returns context from briefId', () => {
    topicStore.createTopic({ title: '选题' });

    getBriefRegistry().createBrief({
      topicId: 'topic-1',
      workingTitle: '标题',
      thesis: '核心观点',
      audience: '开发者',
      tone: '专业',
      outline: [{ heading: '引言', purpose: '铺垫', evidenceSignalIds: [] }],
      sourceLinks: [{ title: '来源A', url: 'https://a.com' }],
    });

    const ctx = buildWritingAgentContext({ briefId: 'brief-1' });
    expect(ctx).toMatchObject({
      thesis: '核心观点',
      audience: '开发者',
      tone: '专业',
    });
    expect(ctx?.outline).toContain('引言');
    expect(ctx?.sources).toContain('来源A');
  });

  test('returns context from topicId lookup', () => {
    topicStore.createTopic({ title: '测试选题' });

    getBriefRegistry().createBrief({
      topicId: 'topic-1',
      thesis: '从选题找到的观点',
    });

    const ctx = buildWritingAgentContext({ topicId: 'topic-1' });
    expect(ctx?.thesis).toBe('从选题找到的观点');
    expect(ctx?.topicTitle).toBe('测试选题');
  });
});

describe('formatContextForPrompt', () => {
  test('formats context fields', () => {
    const result = formatContextForPrompt({
      topicTitle: '话题',
      thesis: '观点',
      audience: '读者',
      tone: '语气',
      outline: '- 段1\n- 段2',
    });

    expect(result).toContain('选题：话题');
    expect(result).toContain('核心观点：观点');
    expect(result).toContain('目标读者：读者');
    expect(result).toContain('语气：语气');
    expect(result).toContain('大纲：\n- 段1\n- 段2');
  });

  test('returns empty string for empty context', () => {
    expect(formatContextForPrompt({})).toBe('');
  });

  test('truncates to limit keeping priority fields', () => {
    const longThesis = 'A'.repeat(1500);
    const longOutline = 'B'.repeat(1500);
    const result = formatContextForPrompt({
      thesis: longThesis,
      audience: '读者',
      outline: longOutline,
      sources: 'C'.repeat(500),
    });

    expect(result.length).toBeLessThanOrEqual(2000);
    expect(result).toContain('核心观点');
  });
});
