import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createTopicStore } from '@/lib/topics/store';
import type { Signal } from '@/lib/signals/types';

function makeStore(
  overrides: {
    storagePath?: string;
    ids?: string[];
    timestamps?: string[];
  } = {},
) {
  const ids = overrides.ids ?? [];
  const timestamps = overrides.timestamps ?? [];
  let idIndex = 0;
  let tsIndex = 0;

  return createTopicStore({
    createId: () => ids[idIndex++] ?? `topic-${idIndex}`,
    now: () => timestamps[tsIndex++] ?? `2026-05-10T0${tsIndex}:00:00.000Z`,
    storagePath: overrides.storagePath,
  });
}

function makeFakeSignal(overrides: Partial<Signal> = {}): Signal {
  return {
    id: 'sig-1',
    sourceId: 'src-1',
    sourceType: 'rss',
    title: '测试信号标题',
    summary: '测试信号摘要',
    url: 'https://example.com/test',
    capturedAt: '2026-05-10T01:00:00.000Z',
    status: 'new',
    tags: ['ai'],
    score: {
      freshness: 0.8,
      relevance: 0.5,
      credibility: 0.7,
      writingPotential: 0.6,
      audienceFit: 0.4,
    },
    createdAt: '2026-05-10T01:00:00.000Z',
    updatedAt: '2026-05-10T01:00:00.000Z',
    ...overrides,
  };
}

describe('createTopicStore', () => {
  test('creates a topic with default values', () => {
    const store = makeStore({ ids: ['topic-1'] });

    const topic = store.createTopic({
      title: 'AI 写作工具的未来',
      angle: '从用户视角出发',
      summary: '分析当前 AI 写作工具的趋势',
    });

    expect(topic).toMatchObject({
      id: 'topic-1',
      title: 'AI 写作工具的未来',
      angle: '从用户视角出发',
      summary: '分析当前 AI 写作工具的趋势',
      status: 'idea',
      signalIds: [],
      tags: [],
      writingValue: 0,
      urgency: 0,
    });
    expect(topic.recommendedPlatforms).toEqual(['wechat', 'xiaohongshu', 'zhihu', 'x']);
  });

  test('creates topic from single signal', () => {
    const store = makeStore({ ids: ['topic-1'] });
    const signal = makeFakeSignal({ id: 'sig-1', title: '信号标题', summary: '信号摘要' });

    const topic = store.createTopicFromSignals([signal]);

    expect(topic).toMatchObject({
      title: '信号标题',
      summary: '信号摘要',
      signalIds: ['sig-1'],
      tags: ['ai'],
      writingValue: 0.6,
      urgency: 0,
    });
  });

  test('creates topic from multiple signals', () => {
    const store = makeStore({ ids: ['topic-1'] });
    const signals = [
      makeFakeSignal({ id: 'sig-1', title: '标题A', summary: '摘要A', tags: ['ai'] }),
      makeFakeSignal({ id: 'sig-2', title: '标题B', summary: '摘要B', tags: ['tech'] }),
      makeFakeSignal({ id: 'sig-3', title: '标题C', summary: '摘要C', tags: ['ai', 'startup'] }),
    ];

    const topic = store.createTopicFromSignals(signals);

    expect(topic.title).toBe('标题A 等 3 条相关资讯');
    expect(topic.signalIds).toEqual(['sig-1', 'sig-2', 'sig-3']);
    expect(topic.tags).toContain('ai');
    expect(topic.tags).toContain('tech');
    expect(topic.tags).toContain('startup');
    expect(topic.urgency).toBe(0.5);
  });

  test('throws when creating topic from empty signals', () => {
    const store = makeStore();
    expect(() => store.createTopicFromSignals([])).toThrow('至少需要一条信号来创建选题');
  });

  test('updates topic status with valid transition', () => {
    const store = makeStore({
      ids: ['topic-1'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });

    store.createTopic({ title: '选题' });
    const updated = store.updateTopic('topic-1', { status: 'researching' });

    expect(updated?.status).toBe('researching');
    expect(updated?.updatedAt).toBe('2026-05-10T02:00:00.000Z');
  });

  test('rejects invalid status transition from published to idea', () => {
    const store = makeStore({
      ids: ['topic-1'],
      timestamps: [
        '2026-05-10T01:00:00.000Z',
        '2026-05-10T02:00:00.000Z',
        '2026-05-10T03:00:00.000Z',
      ],
    });

    store.createTopic({ title: '选题' });
    store.updateTopic('topic-1', { status: 'published' });
    const result = store.updateTopic('topic-1', { status: 'idea' });

    expect(result).toBeNull();
  });

  test('allows any status to transition to archived', () => {
    const store = makeStore({
      ids: ['topic-1'],
      timestamps: [
        '2026-05-10T01:00:00.000Z',
        '2026-05-10T02:00:00.000Z',
        '2026-05-10T03:00:00.000Z',
      ],
    });

    store.createTopic({ title: '选题' });
    store.updateTopic('topic-1', { status: 'published' });
    const archived = store.archiveTopic('topic-1');

    expect(archived?.status).toBe('archived');
  });

  test('archives topic', () => {
    const store = makeStore({ ids: ['topic-1'] });
    store.createTopic({ title: '选题' });

    const archived = store.archiveTopic('topic-1');
    expect(archived?.status).toBe('archived');
  });

  test('lists topics filtered by status', () => {
    const store = makeStore({ ids: ['topic-1', 'topic-2'] });
    store.createTopic({ title: '选题1' });
    store.createTopic({ title: '选题2' });
    store.updateTopic('topic-1', { status: 'researching' });

    const list = store.listTopics({ status: 'researching' });
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('topic-1');
  });

  test('lists topics filtered by tag', () => {
    const store = makeStore({ ids: ['topic-1', 'topic-2'] });
    store.createTopic({ title: '选题1', tags: ['ai'] });
    store.createTopic({ title: '选题2', tags: ['crypto'] });

    const list = store.listTopics({ tag: 'ai' });
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('topic-1');
  });

  test('lists topics sorted by updatedAt desc', () => {
    const store = makeStore({
      ids: ['topic-1', 'topic-2'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T03:00:00.000Z'],
    });

    store.createTopic({ title: '旧选题' });
    store.createTopic({ title: '新选题' });

    const list = store.listTopics();
    expect(list[0].id).toBe('topic-2');
  });

  test('returns null when updating non-existent topic', () => {
    const store = makeStore();
    expect(store.updateTopic('non-existent', { title: '新标题' })).toBeNull();
  });

  test('persists topics to file and restores on restart', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'publio-topics-'));
    const storagePath = join(dataDir, 'topics.json');

    try {
      const store = createTopicStore({
        createId: () => 'topic-persist-1',
        now: () => '2026-05-10T01:00:00.000Z',
        storagePath,
      });

      store.createTopic({ title: '持久化选题', tags: ['test'] });

      const restored = createTopicStore({ storagePath });
      const topic = restored.getTopic('topic-persist-1');

      expect(topic).toMatchObject({
        id: 'topic-persist-1',
        title: '持久化选题',
        tags: ['test'],
        status: 'idea',
      });
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
