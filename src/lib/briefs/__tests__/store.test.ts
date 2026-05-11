import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createBriefStore } from '@/lib/briefs/store';

function makeFakeTopicLookup(existingIds: string[] = ['topic-1']) {
  return {
    getTopic(id: string) {
      return existingIds.includes(id) ? { id } : null;
    },
  };
}

function makeStore(
  overrides: {
    storagePath?: string;
    ids?: string[];
    timestamps?: string[];
    topicIds?: string[];
  } = {},
) {
  const ids = overrides.ids ?? [];
  const timestamps = overrides.timestamps ?? [];
  let idIndex = 0;
  let tsIndex = 0;

  return createBriefStore({
    createId: () => ids[idIndex++] ?? `brief-${idIndex}`,
    now: () => timestamps[tsIndex++] ?? `2026-05-10T0${tsIndex}:00:00.000Z`,
    storagePath: overrides.storagePath,
    topicLookup: makeFakeTopicLookup(overrides.topicIds ?? ['topic-1', 'topic-2']),
  });
}

describe('createBriefStore', () => {
  test('creates a brief with defaults', () => {
    const store = makeStore({ ids: ['brief-1'] });

    const brief = store.createBrief({ topicId: 'topic-1' });

    expect(brief).toMatchObject({
      id: 'brief-1',
      topicId: 'topic-1',
      workingTitle: '',
      thesis: '',
      audience: '',
      tone: '',
      outline: [],
      sourceLinks: [],
      platformPlan: [],
    });
    expect(brief.createdAt).toBeTruthy();
    expect(brief.updatedAt).toBeTruthy();
  });

  test('creates a brief with full input', () => {
    const store = makeStore({ ids: ['brief-2'] });

    const brief = store.createBrief({
      topicId: 'topic-1',
      workingTitle: 'AI 工具趋势',
      thesis: '工具正在从辅助走向主导',
      audience: '独立开发者',
      tone: '专业但平易近人',
      outline: [
        { heading: '现状', purpose: '铺垫背景', evidenceSignalIds: ['sig-1'] },
        { heading: '趋势', purpose: '核心论点', evidenceSignalIds: ['sig-2'] },
      ],
      sourceLinks: [{ title: '来源A', url: 'https://a.com', signalId: 'sig-1' }],
      platformPlan: [{ platform: 'wechat', intent: '深度长文', estimatedLength: 3000 }],
    });

    expect(brief.workingTitle).toBe('AI 工具趋势');
    expect(brief.outline).toHaveLength(2);
    expect(brief.sourceLinks).toHaveLength(1);
    expect(brief.platformPlan[0].platform).toBe('wechat');
  });

  test('throws when topicId is empty', () => {
    const store = makeStore();
    expect(() => store.createBrief({ topicId: '' })).toThrow('Brief 必须关联一个选题');
  });

  test('throws when topic does not exist', () => {
    const store = makeStore({ topicIds: ['topic-1'] });
    expect(() => store.createBrief({ topicId: 'topic-nonexistent' })).toThrow(
      '选题 topic-nonexistent 不存在',
    );
  });

  test('gets brief by id', () => {
    const store = makeStore({ ids: ['brief-1'] });
    store.createBrief({ topicId: 'topic-1', workingTitle: '标题' });

    expect(store.getBrief('brief-1')?.workingTitle).toBe('标题');
    expect(store.getBrief('non-existent')).toBeNull();
  });

  test('gets brief by topicId', () => {
    const store = makeStore({ ids: ['brief-1', 'brief-2'] });
    store.createBrief({ topicId: 'topic-1', workingTitle: '第一个' });
    store.createBrief({ topicId: 'topic-2', workingTitle: '第二个' });

    const found = store.getBriefByTopicId('topic-1');
    expect(found?.workingTitle).toBe('第一个');
    expect(store.getBriefByTopicId('topic-nonexistent')).toBeNull();
  });

  test('updates brief outline and fields', () => {
    const store = makeStore({
      ids: ['brief-1'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });
    store.createBrief({ topicId: 'topic-1' });

    const updated = store.updateBrief('brief-1', {
      workingTitle: '更新后的标题',
      outline: [{ heading: '引言', purpose: '开篇', evidenceSignalIds: [] }],
    });

    expect(updated?.workingTitle).toBe('更新后的标题');
    expect(updated?.outline).toHaveLength(1);
    expect(updated?.updatedAt).toBe('2026-05-10T02:00:00.000Z');
  });

  test('returns null when updating non-existent brief', () => {
    const store = makeStore();
    expect(store.updateBrief('non-existent', { workingTitle: '无' })).toBeNull();
  });

  test('deletes brief', () => {
    const store = makeStore({ ids: ['brief-1'] });
    store.createBrief({ topicId: 'topic-1' });

    expect(store.deleteBrief('brief-1')).toBe(true);
    expect(store.getBrief('brief-1')).toBeNull();
    expect(store.deleteBrief('brief-1')).toBe(false);
  });

  test('lists briefs filtered by topicId', () => {
    const store = makeStore({ ids: ['brief-1', 'brief-2'] });
    store.createBrief({ topicId: 'topic-1' });
    store.createBrief({ topicId: 'topic-2' });

    const list = store.listBriefs({ topicId: 'topic-1' });
    expect(list).toHaveLength(1);
    expect(list[0].topicId).toBe('topic-1');
  });

  test('lists briefs sorted by updatedAt desc', () => {
    const store = makeStore({
      ids: ['brief-1', 'brief-2'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T03:00:00.000Z'],
    });

    store.createBrief({ topicId: 'topic-1', workingTitle: '旧' });
    store.createBrief({ topicId: 'topic-2', workingTitle: '新' });

    const list = store.listBriefs();
    expect(list[0].workingTitle).toBe('新');
  });

  test('persists briefs to file and restores on restart', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'publio-briefs-'));
    const storagePath = join(dataDir, 'briefs.json');

    try {
      const store = createBriefStore({
        createId: () => 'brief-persist-1',
        now: () => '2026-05-10T01:00:00.000Z',
        storagePath,
        topicLookup: makeFakeTopicLookup(['topic-1']),
      });

      store.createBrief({ topicId: 'topic-1', workingTitle: '持久化 Brief' });

      const restored = createBriefStore({
        storagePath,
        topicLookup: makeFakeTopicLookup(['topic-1']),
      });
      const brief = restored.getBrief('brief-persist-1');

      expect(brief).toMatchObject({
        id: 'brief-persist-1',
        topicId: 'topic-1',
        workingTitle: '持久化 Brief',
      });
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });

  test('works without topicLookup (no validation)', () => {
    const store = createBriefStore({
      createId: () => 'brief-no-lookup',
      now: () => '2026-05-10T01:00:00.000Z',
    });

    const brief = store.createBrief({ topicId: 'any-topic' });
    expect(brief.topicId).toBe('any-topic');
  });
});
