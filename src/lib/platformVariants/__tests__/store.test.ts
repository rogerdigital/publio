import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createPlatformVariantStore } from '@/lib/platformVariants/store';

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

  return createPlatformVariantStore({
    createId: () => ids[idIndex++] ?? `variant-${idIndex}`,
    now: () => timestamps[tsIndex++] ?? `2026-05-10T0${tsIndex}:00:00.000Z`,
    storagePath: overrides.storagePath,
  });
}

describe('createPlatformVariantStore', () => {
  test('creates a variant with default values', () => {
    const store = makeStore({ ids: ['variant-1'] });

    const variant = store.createVariant({
      draftId: 'draft-1',
      platform: 'wechat',
      title: '公众号标题',
      content: '公众号内容',
    });

    expect(variant).toMatchObject({
      id: 'variant-1',
      draftId: 'draft-1',
      platform: 'wechat',
      title: '公众号标题',
      content: '公众号内容',
      status: 'synced',
      generatedByAgent: false,
      manuallyEdited: false,
    });
    expect(variant.lastSyncedFromDraftAt).toBeTruthy();
  });

  test('gets variant by draft and platform', () => {
    const store = makeStore({ ids: ['variant-1', 'variant-2'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: 'A', content: 'A' });
    store.createVariant({ draftId: 'draft-1', platform: 'zhihu', title: 'B', content: 'B' });

    const found = store.getVariantByDraftAndPlatform('draft-1', 'zhihu');
    expect(found?.title).toBe('B');
    expect(store.getVariantByDraftAndPlatform('draft-1', 'x')).toBeNull();
  });

  test('lists variants by draft', () => {
    const store = makeStore({ ids: ['variant-1', 'variant-2', 'variant-3'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: 'A', content: 'A' });
    store.createVariant({ draftId: 'draft-1', platform: 'zhihu', title: 'B', content: 'B' });
    store.createVariant({ draftId: 'draft-2', platform: 'x', title: 'C', content: 'C' });

    expect(store.listVariantsByDraft('draft-1')).toHaveLength(2);
    expect(store.listVariantsByDraft('draft-2')).toHaveLength(1);
  });

  test('updating content sets manuallyEdited and status to edited', () => {
    const store = makeStore({ ids: ['variant-1'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: 'A', content: 'A' });

    const updated = store.updateVariant('variant-1', { content: '手动修改' });

    expect(updated?.manuallyEdited).toBe(true);
    expect(updated?.status).toBe('edited');
  });

  test('syncVariantsFromDraft creates new variants for missing platforms', () => {
    const store = makeStore({ ids: ['variant-1', 'variant-2'] });

    const results = store.syncVariantsFromDraft('draft-1', '标题', '内容', ['wechat', 'zhihu']);

    expect(results).toHaveLength(2);
    expect(results[0].platform).toBe('wechat');
    expect(results[1].platform).toBe('zhihu');
    expect(results[0].status).toBe('synced');
  });

  test('syncVariantsFromDraft updates synced non-edited variants', () => {
    const store = makeStore({
      ids: ['variant-1', 'variant-2'],
      timestamps: ['2026-05-10T01:00:00.000Z', '2026-05-10T02:00:00.000Z'],
    });

    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: '旧', content: '旧内容' });

    const results = store.syncVariantsFromDraft('draft-1', '新标题', '新内容', ['wechat']);

    expect(results[0].title).toBe('新标题');
    expect(results[0].content).toBe('新内容');
    expect(results[0].status).toBe('synced');
  });

  test('syncVariantsFromDraft skips manually edited variants', () => {
    const store = makeStore({ ids: ['variant-1'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: '原始', content: '原始' });
    store.updateVariant('variant-1', { content: '手动修改' });

    const results = store.syncVariantsFromDraft('draft-1', '新标题', '新内容', ['wechat']);

    expect(results[0].content).toBe('手动修改');
    expect(results[0].manuallyEdited).toBe(true);
  });

  test('syncVariantsFromDraft skips non-synced status variants', () => {
    const store = makeStore({ ids: ['variant-1'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: '原始', content: '原始' });
    store.updateVariant('variant-1', { status: 'adapted', manuallyEdited: false });

    const results = store.syncVariantsFromDraft('draft-1', '新标题', '新内容', ['wechat']);

    expect(results[0].title).toBe('原始');
    expect(results[0].status).toBe('adapted');
  });

  test('deletes variant', () => {
    const store = makeStore({ ids: ['variant-1'] });
    store.createVariant({ draftId: 'draft-1', platform: 'wechat', title: 'A', content: 'A' });

    expect(store.deleteVariant('variant-1')).toBe(true);
    expect(store.getVariant('variant-1')).toBeNull();
    expect(store.deleteVariant('variant-1')).toBe(false);
  });

  test('persists to file and restores', () => {
    const dataDir = mkdtempSync(join(tmpdir(), 'publio-variants-'));
    const storagePath = join(dataDir, 'variants.json');

    try {
      const store = createPlatformVariantStore({
        createId: () => 'variant-persist',
        now: () => '2026-05-10T01:00:00.000Z',
        storagePath,
      });

      store.createVariant({ draftId: 'draft-1', platform: 'x', title: 'X 内容', content: '正文' });

      const restored = createPlatformVariantStore({ storagePath });
      const variant = restored.getVariant('variant-persist');

      expect(variant).toMatchObject({
        id: 'variant-persist',
        platform: 'x',
        title: 'X 内容',
      });
    } finally {
      rmSync(dataDir, { recursive: true, force: true });
    }
  });
});
