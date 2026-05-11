import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createSignalStore } from '@/lib/signals/store';

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

  return createSignalStore({
    createId: () => ids[idIndex++] ?? `sig-${idIndex}`,
    now: () => timestamps[tsIndex++] ?? `2026-05-10T0${tsIndex}:00:00.000Z`,
    storagePath: overrides.storagePath,
  });
}

describe('createSignalStore', () => {
  test('creates a signal with default values', () => {
    const store = makeStore({
      ids: ['sig-1'],
      timestamps: ['2026-05-10T01:00:00.000Z'],
    });

    const signal = store.createSignal({
      sourceId: 'source-rss-1',
      sourceType: 'rss',
      title: 'AI 新进展',
      summary: '最新的 AI 技术突破',
      url: 'https://example.com/ai-news',
      author: '记者小明',
      publishedAt: '2026-05-09T10:00:00.000Z',
    });

    expect(signal).toMatchObject({
      id: 'sig-1',
      sourceId: 'source-rss-1',
      sourceType: 'rss',
      title: 'AI 新进展',
      summary: '最新的 AI 技术突破',
      url: 'https://example.com/ai-news',
      author: '记者小明',
      publishedAt: '2026-05-09T10:00:00.000Z',
      capturedAt: '2026-05-10T01:00:00.000Z',
      status: 'new',
      tags: [],
      score: {
        freshness: 0,
        relevance: 0,
        credibility: 0,
        writingPotential: 0,
        audienceFit: 0,
      },
      createdAt: '2026-05-10T01:00:00.000Z',
      updatedAt: '2026-05-10T01:00:00.000Z',
    });
  });

  test('creates a signal with partial score', () => {
    const store = makeStore({ ids: ['sig-2'] });

    const signal = store.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '标题',
      summary: '摘要',
      score: { freshness: 0.9, credibility: 0.7 },
    });

    expect(signal.score).toEqual({
      freshness: 0.9,
      relevance: 0,
      credibility: 0.7,
      writingPotential: 0,
      audienceFit: 0,
    });
  });

  test('updates signal status', () => {
    const store = makeStore({
      ids: ['sig-1'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });

    store.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '标题',
      summary: '摘要',
    });

    const updated = store.updateSignal('sig-1', { status: 'saved' });

    expect(updated).toMatchObject({
      id: 'sig-1',
      status: 'saved',
      updatedAt: '2026-05-10T02:00:00.000Z',
    });
  });

  test('updates signal tags and notes', () => {
    const store = makeStore({ ids: ['sig-1'] });

    store.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '标题',
      summary: '摘要',
    });

    const updated = store.updateSignal('sig-1', {
      tags: ['ai', 'tech'],
      notes: '这条值得关注',
    });

    expect(updated?.tags).toEqual(['ai', 'tech']);
    expect(updated?.notes).toBe('这条值得关注');
  });

  test('returns null when updating non-existent signal', () => {
    const store = makeStore();
    expect(store.updateSignal('non-existent', { status: 'saved' })).toBeNull();
  });

  test('deletes a signal', () => {
    const store = makeStore({ ids: ['sig-1'] });

    store.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '标题',
      summary: '摘要',
    });

    expect(store.deleteSignal('sig-1')).toBe(true);
    expect(store.getSignal('sig-1')).toBeNull();
  });

  test('returns false when deleting non-existent signal', () => {
    const store = makeStore();
    expect(store.deleteSignal('non-existent')).toBe(false);
  });

  test('lists signals sorted by capturedAt descending', () => {
    const store = makeStore({
      ids: ['sig-1', 'sig-2', 'sig-3'],
      timestamps: [
        '2026-05-10T01:00:00.000Z', // sig-1 created
        '2026-05-10T03:00:00.000Z', // sig-2 created
        '2026-05-10T02:00:00.000Z', // sig-3 created
      ],
    });

    store.createSignal({ sourceId: 's1', sourceType: 'rss', title: '第一条', summary: '摘要1' });
    store.createSignal({ sourceId: 's2', sourceType: 'rss', title: '第二条', summary: '摘要2' });
    store.createSignal({ sourceId: 's3', sourceType: 'rss', title: '第三条', summary: '摘要3' });

    const list = store.listSignals();
    expect(list.map((s) => s.id)).toEqual(['sig-2', 'sig-3', 'sig-1']);
  });

  test('filters signals by status', () => {
    const store = makeStore({ ids: ['sig-1', 'sig-2'] });

    store.createSignal({ sourceId: 's1', sourceType: 'rss', title: '第一条', summary: '摘要1' });
    store.createSignal({ sourceId: 's2', sourceType: 'rss', title: '第二条', summary: '摘要2' });
    store.updateSignal('sig-1', { status: 'saved' });

    expect(store.listSignals({ status: 'saved' })).toHaveLength(1);
    expect(store.listSignals({ status: 'saved' })[0].id).toBe('sig-1');
  });

  test('filters signals by tag', () => {
    const store = makeStore({ ids: ['sig-1', 'sig-2'] });

    store.createSignal({
      sourceId: 's1',
      sourceType: 'rss',
      title: '标题1',
      summary: '摘要1',
      tags: ['ai'],
    });
    store.createSignal({
      sourceId: 's2',
      sourceType: 'rss',
      title: '标题2',
      summary: '摘要2',
      tags: ['crypto'],
    });

    expect(store.listSignals({ tag: 'ai' })).toHaveLength(1);
    expect(store.listSignals({ tag: 'ai' })[0].id).toBe('sig-1');
  });

  test('filters signals by sourceId', () => {
    const store = makeStore({ ids: ['sig-1', 'sig-2'] });

    store.createSignal({ sourceId: 'src-a', sourceType: 'rss', title: '标题1', summary: '摘要1' });
    store.createSignal({ sourceId: 'src-b', sourceType: 'rss', title: '标题2', summary: '摘要2' });

    expect(store.listSignals({ sourceId: 'src-a' })).toHaveLength(1);
    expect(store.listSignals({ sourceId: 'src-a' })[0].id).toBe('sig-1');
  });

  test('filters signals by keyword search', () => {
    const store = makeStore({ ids: ['sig-1', 'sig-2'] });

    store.createSignal({
      sourceId: 's1',
      sourceType: 'rss',
      title: 'OpenAI 发布 GPT-5',
      summary: '新模型',
    });
    store.createSignal({
      sourceId: 's2',
      sourceType: 'rss',
      title: 'Apple 新品发布',
      summary: '手机',
    });

    expect(store.listSignals({ q: 'openai' })).toHaveLength(1);
    expect(store.listSignals({ q: 'openai' })[0].id).toBe('sig-1');
  });

  test('upsert deduplicates by URL', () => {
    const store = makeStore({
      ids: ['sig-1', 'sig-2'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's1',
      sourceType: 'rss',
      title: '原始标题',
      summary: '原始摘要',
      url: 'https://example.com/article-1',
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's1',
      sourceType: 'rss',
      title: '更新标题',
      summary: '更新摘要',
      url: 'https://example.com/article-1',
    });

    const list = store.listSignals();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('sig-1');
    expect(list[0].summary).toBe('更新摘要');
    expect(list[0].title).toBe('原始标题'); // title not overwritten on upsert
  });

  test('upsert deduplicates by title + sourceId', () => {
    const store = makeStore({
      ids: ['sig-1', 'sig-2'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's1',
      sourceType: 'rss',
      title: '相同标题',
      summary: '摘要v1',
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's1',
      sourceType: 'rss',
      title: '相同标题',
      summary: '摘要v2',
    });

    const list = store.listSignals();
    expect(list).toHaveLength(1);
    expect(list[0].summary).toBe('摘要v2');
  });

  test('upsert creates new signal when no match found', () => {
    const store = makeStore({
      ids: ['sig-1', 'sig-2'],
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's1',
      sourceType: 'rss',
      title: '标题A',
      summary: '摘要A',
      url: 'https://example.com/a',
    });

    store.upsertSignalFromFeedItem({
      sourceId: 's2',
      sourceType: 'rss',
      title: '标题B',
      summary: '摘要B',
      url: 'https://example.com/b',
    });

    expect(store.listSignals()).toHaveLength(2);
  });

  test('persists signals to file and restores on restart', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'publio-signals-'));
    const storagePath = join(dataDir, 'signals.json');

    try {
      const store = createSignalStore({
        createId: () => 'sig-persist-1',
        now: () => '2026-05-10T01:00:00.000Z',
        storagePath,
      });

      store.createSignal({
        sourceId: 'src-1',
        sourceType: 'rss',
        title: '持久化测试',
        summary: '测试摘要',
        tags: ['test'],
      });

      const restored = createSignalStore({ storagePath });
      const signal = restored.getSignal('sig-persist-1');

      expect(signal).toMatchObject({
        id: 'sig-persist-1',
        title: '持久化测试',
        summary: '测试摘要',
        tags: ['test'],
        status: 'new',
      });
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
