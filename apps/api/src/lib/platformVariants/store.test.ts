import { describe, expect, it } from 'vitest';

import { createPlatformVariantStore } from '@/lib/platformVariants/store';
import type { PlatformVariant } from '@/lib/platformVariants/types';

const initialTimestamp = '2026-07-15T00:00:00.000Z';
const updatedTimestamp = '2026-07-15T00:01:00.000Z';

function createVariant(
  overrides: Partial<PlatformVariant> & Pick<PlatformVariant, 'id' | 'platform'>,
): PlatformVariant {
  return {
    draftId: 'draft-1',
    title: 'Original title',
    content: 'Original content',
    status: 'synced',
    generatedByAgent: false,
    manuallyEdited: false,
    sourceDraftRevision: 1,
    stale: false,
    lastSyncedFromDraftAt: initialTimestamp,
    createdAt: initialTimestamp,
    updatedAt: initialTimestamp,
    ...overrides,
    id: overrides.id,
    platform: overrides.platform,
  };
}

function createStore(initialVariants: PlatformVariant[] = []) {
  return createPlatformVariantStore({
    createId: () => 'variant-new',
    now: () => updatedTimestamp,
    initialVariants,
  });
}

describe('createPlatformVariantStore freshness', () => {
  it('records the source revision and freshness for a new synced variant', () => {
    const [variant] = createStore().syncVariantsFromDraft(
      'draft-1',
      'Current title',
      'Current content',
      ['wechat'],
      { sourceDraftRevision: 2 },
    );

    expect(variant).toMatchObject({
      sourceDraftRevision: 2,
      stale: false,
      status: 'synced',
    });
  });

  it('marks an older manually edited variant stale without changing its content provenance', () => {
    const editedVariant = createVariant({
      id: 'variant-edited',
      platform: 'wechat',
      content: 'Edited content',
      status: 'edited',
      manuallyEdited: true,
    });
    const currentVariant = createVariant({
      id: 'variant-current',
      platform: 'zhihu',
      sourceDraftRevision: 2,
    });
    const store = createStore([editedVariant, currentVariant]);

    expect(typeof store.markVariantsStale).toBe('function');
    const changed = store.markVariantsStale('draft-1', 2);

    expect(changed).toEqual([
      expect.objectContaining({
        id: 'variant-edited',
        content: 'Edited content',
        manuallyEdited: true,
        sourceDraftRevision: 1,
        stale: true,
        updatedAt: updatedTimestamp,
      }),
    ]);
    expect(store.getVariant('variant-current')).toEqual(currentVariant);
  });

  it('refreshes an unprotected variant but preserves an edited variant as stale', () => {
    const ruleVariant = createVariant({ id: 'variant-rule', platform: 'wechat' });
    const editedVariant = createVariant({
      id: 'variant-edited',
      platform: 'zhihu',
      content: 'Edited content',
      status: 'edited',
      manuallyEdited: true,
    });
    const store = createStore([ruleVariant, editedVariant]);

    store.markVariantsStale('draft-1', 2);
    const variants = store.syncVariantsFromDraft(
      'draft-1',
      'Current title',
      'Current content',
      ['wechat', 'zhihu'],
      { sourceDraftRevision: 2 },
    );

    expect(variants[0]).toMatchObject({
      id: 'variant-rule',
      title: 'Current title',
      content: 'Current content',
      sourceDraftRevision: 2,
      stale: false,
    });
    expect(variants[1]).toMatchObject({
      id: 'variant-edited',
      content: 'Edited content',
      manuallyEdited: true,
      sourceDraftRevision: 1,
      stale: true,
      updatedAt: updatedTimestamp,
    });
  });

  it('preserves stale freshness when syncing protected content from an older draft revision', () => {
    const editedVariant = createVariant({
      id: 'variant-edited',
      platform: 'wechat',
      content: 'Edited content',
      status: 'edited',
      manuallyEdited: true,
    });
    const store = createStore([editedVariant]);

    expect(store.markVariantsStale('draft-1', 2)[0]?.stale).toBe(true);
    const [variant] = store.syncVariantsFromDraft(
      'draft-1',
      'Older title',
      'Older content',
      ['wechat'],
      { sourceDraftRevision: 1 },
    );

    expect(variant).toMatchObject({
      content: 'Edited content',
      sourceDraftRevision: 1,
      stale: true,
    });
  });

  it('marks protected content stale when syncing from a newer draft revision', () => {
    const editedVariant = createVariant({
      id: 'variant-edited',
      platform: 'wechat',
      content: 'Edited content',
      status: 'edited',
      manuallyEdited: true,
    });
    const store = createStore([editedVariant]);

    const [variant] = store.syncVariantsFromDraft(
      'draft-1',
      'Current title',
      'Current content',
      ['wechat'],
      { sourceDraftRevision: 2 },
    );

    expect(variant).toMatchObject({
      content: 'Edited content',
      sourceDraftRevision: 1,
      stale: true,
    });
  });

  it('replaces protected content when explicitly requested', () => {
    const editedVariant = createVariant({
      id: 'variant-edited',
      platform: 'wechat',
      status: 'edited',
      generatedByAgent: true,
      manuallyEdited: true,
      changeSummary: 'Manual adaptation',
      stale: true,
    });
    const store = createStore([editedVariant]);

    const [variant] = store.syncVariantsFromDraft(
      'draft-1',
      'Current title',
      'Current content',
      ['wechat'],
      { sourceDraftRevision: 2, replaceProtected: true },
    );

    expect(variant).toMatchObject({
      title: 'Current title',
      content: 'Current content',
      status: 'synced',
      generatedByAgent: false,
      manuallyEdited: false,
      sourceDraftRevision: 2,
      stale: false,
      updatedAt: updatedTimestamp,
    });
    expect(variant.changeSummary).toBeUndefined();
  });

  it('normalizes legacy freshness fields while preserving valid source revisions', () => {
    const invalidLegacyVariant = {
      ...createVariant({ id: 'variant-invalid', platform: 'wechat' }),
      sourceDraftRevision: 0,
      stale: 'true',
    } as unknown as PlatformVariant;
    const validLegacyVariant = createVariant({
      id: 'variant-valid',
      platform: 'zhihu',
      sourceDraftRevision: 3,
      stale: true,
    });
    const store = createStore([invalidLegacyVariant, validLegacyVariant]);

    expect(store.getVariant('variant-invalid')).toMatchObject({
      sourceDraftRevision: 1,
      stale: false,
    });
    expect(store.getVariant('variant-valid')).toMatchObject({
      sourceDraftRevision: 3,
      stale: true,
    });
  });
});
