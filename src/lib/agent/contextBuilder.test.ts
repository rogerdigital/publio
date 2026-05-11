import { describe, expect, test } from 'vitest';
import { buildAgentContext, formatAgentContext } from '@/lib/agent/contextBuilder';
import type { BuildAgentContextInput } from '@/lib/agent/contextBuilder';
import type { Signal } from '@/lib/signals/types';
import type { Topic } from '@/lib/topics/types';
import type { Brief } from '@/lib/briefs/types';
import type { ContentDraft } from '@/lib/drafts/types';

function makeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    sourceId: 'rss-1',
    sourceType: 'rss',
    title: 'AI 大模型新进展',
    summary: '概述',
    url: 'https://example.com',
    publishedAt: '2026-05-10T00:00:00.000Z',
    capturedAt: '2026-05-10T00:00:00.000Z',
    status: 'new',
    tags: ['AI'],
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
    ...overrides,
  };
}

function makeTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 'topic-1',
    title: '大模型落地',
    signalIds: ['sig-1'],
    status: 'active',
    tags: ['AI'],
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
    ...overrides,
  };
}

function makeBrief(overrides: Partial<Brief> = {}): Brief {
  return {
    id: 'brief-1',
    topicId: 'topic-1',
    workingTitle: '标题',
    thesis: '核心观点',
    audience: '开发者',
    tone: '专业',
    outline: [{ heading: '引言', purpose: '铺垫', evidenceSignalIds: [] }],
    sourceLinks: [{ title: '来源A', url: 'https://a.com' }],
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
    ...overrides,
  };
}

function makeDraft(overrides: Partial<ContentDraft> = {}): ContentDraft {
  return {
    id: 'draft-1',
    title: '测试稿件',
    content: '稿件正文内容',
    status: 'editing',
    source: 'manual',
    createdAt: '2026-05-10T00:00:00.000Z',
    updatedAt: '2026-05-10T00:00:00.000Z',
    ...overrides,
  };
}

describe('buildAgentContext', () => {
  test('minimal input returns phase only', () => {
    const ctx = buildAgentContext({ phase: 'draft-writing' });
    expect(ctx.phase).toBe('draft-writing');
    expect(ctx.signals).toBeUndefined();
    expect(ctx.topic).toBeUndefined();
  });

  test('includes all provided entities', () => {
    const input: BuildAgentContextInput = {
      phase: 'adaptation',
      signals: [makeSignal()],
      topic: makeTopic(),
      brief: makeBrief(),
      draft: makeDraft(),
      userInput: '帮我适配小红书',
    };

    const ctx = buildAgentContext(input);

    expect(ctx.userInput).toBe('帮我适配小红书');
    expect(ctx.topic?.title).toBe('大模型落地');
    expect(ctx.brief?.thesis).toBe('核心观点');
    expect(ctx.draft?.title).toBe('测试稿件');
    expect(ctx.signals).toHaveLength(1);
    expect(ctx.signals![0].title).toBe('AI 大模型新进展');
  });

  test('trims low-priority fields when over limit', () => {
    const longContent = 'A'.repeat(5000);
    const input: BuildAgentContextInput = {
      phase: 'draft-writing',
      userInput: '改写',
      brief: makeBrief(),
      draft: makeDraft({ content: longContent }),
      feedbackSummary: 'B'.repeat(2000),
      signals: Array.from({ length: 50 }, (_, i) =>
        makeSignal({ id: `sig-${i}`, title: `Signal ${i}`, summary: 'X'.repeat(100) }),
      ),
    };

    const ctx = buildAgentContext(input);
    const total = JSON.stringify(ctx).length;

    expect(total).toBeLessThanOrEqual(6500);
    expect(ctx.userInput).toBe('改写');
    expect(ctx.brief).toBeDefined();
  });

  test('truncates draft content when still over limit', () => {
    const input: BuildAgentContextInput = {
      phase: 'draft-writing',
      userInput: '续写',
      draft: makeDraft({ content: 'C'.repeat(8000) }),
    };

    const ctx = buildAgentContext(input);
    expect(ctx.draft!.content.length).toBeLessThan(8000);
    expect(ctx.draft!.content).toContain('已截断');
  });
});

describe('formatAgentContext', () => {
  test('formats all sections', () => {
    const ctx = buildAgentContext({
      phase: 'brief-writing',
      userInput: '补全大纲',
      topic: makeTopic({ title: '话题A', angle: '技术落地', targetAudience: '工程师' }),
      brief: makeBrief(),
      draft: makeDraft(),
    });

    const text = formatAgentContext(ctx);

    expect(text).toContain('用户输入：补全大纲');
    expect(text).toContain('选题：话题A');
    expect(text).toContain('角度：技术落地');
    expect(text).toContain('核心观点：核心观点');
    expect(text).toContain('稿件[editing]：测试稿件');
  });

  test('handles empty context', () => {
    const text = formatAgentContext({ phase: 'signal-review' });
    expect(text).toBe('');
  });
});
