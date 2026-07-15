import { Hono } from 'hono';
import { beforeEach, describe, expect, it } from 'vitest';

import { resetDraftRegistryForTests } from '@/lib/drafts/registry';
import { resetPlatformVariantRegistryForTests } from '@/lib/platformVariants/registry';
import { draftsRoutes } from '@/routes/drafts';
import { platformVariantsRoutes } from '@/routes/platformVariants';

const app = new Hono()
  .route('/api/drafts', draftsRoutes)
  .route('/api/platform-variants', platformVariantsRoutes);

async function createDraft() {
  const response = await app.request('/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Original title',
      content: 'Original content',
    }),
  });

  expect(response.status).toBe(201);
  const body = await response.json();
  return body.draft as { id: string; revision: number };
}

async function syncWechat(draftId: string, force = false) {
  const response = await app.request(`/api/drafts/${draftId}/variants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platforms: ['wechat'], ...(force ? { force: true } : {}) }),
  });

  expect(response.status).toBe(201);
  const body = await response.json();
  return body.variants as Array<{
    id: string;
    content: string;
    status: string;
    generatedByAgent: boolean;
    manuallyEdited: boolean;
    sourceDraftRevision: number;
    stale: boolean;
  }>;
}

async function patchDraft(draftId: string, input: Record<string, unknown>) {
  const response = await app.request(`/api/drafts/${draftId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  expect(response.status).toBe(200);
  return response.json();
}

async function getVariants(draftId: string) {
  const response = await app.request(`/api/drafts/${draftId}/variants`);

  expect(response.status).toBe(200);
  const body = await response.json();
  return body.variants as Array<{
    id: string;
    content: string;
    status: string;
    generatedByAgent: boolean;
    manuallyEdited: boolean;
    sourceDraftRevision: number;
    stale: boolean;
  }>;
}

describe('draft variant revision routes', () => {
  beforeEach(() => {
    resetDraftRegistryForTests({ createId: () => 'draft-1' });
    resetPlatformVariantRegistryForTests({ createId: () => 'variant-1' });
  });

  it('preserves protected stale content until a forced sync replaces it atomically', async () => {
    const draft = await createDraft();
    const [syncedVariant] = await syncWechat(draft.id);

    const editResponse = await app.request(`/api/platform-variants/${syncedVariant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Manual body' }),
    });
    expect(editResponse.status).toBe(200);
    expect(await editResponse.json()).toMatchObject({
      ok: true,
      variant: {
        content: 'Manual body',
        manuallyEdited: true,
        sourceDraftRevision: 1,
      },
    });

    const patchBody = await patchDraft(draft.id, { content: 'Revised draft content' });
    expect(patchBody.draft.revision).toBe(2);
    expect(await getVariants(draft.id)).toEqual([
      expect.objectContaining({
        content: 'Manual body',
        manuallyEdited: true,
        sourceDraftRevision: 1,
        stale: true,
      }),
    ]);

    expect(await syncWechat(draft.id)).toEqual([
      expect.objectContaining({
        content: 'Manual body',
        manuallyEdited: true,
        sourceDraftRevision: 1,
        stale: true,
      }),
    ]);

    expect(await syncWechat(draft.id, true)).toEqual([
      expect.objectContaining({
        content: 'Revised draft content',
        sourceDraftRevision: 2,
        stale: false,
        status: 'synced',
        manuallyEdited: false,
        generatedByAgent: false,
      }),
    ]);
  });

  it('keeps a current variant fresh for metadata-only and same-value content patches', async () => {
    const draft = await createDraft();
    await syncWechat(draft.id);

    const metadataPatch = await patchDraft(draft.id, { status: 'ready' });
    expect(metadataPatch.draft.revision).toBe(1);
    expect(await getVariants(draft.id)).toEqual([
      expect.objectContaining({ sourceDraftRevision: 1, stale: false }),
    ]);

    const sameContentPatch = await patchDraft(draft.id, { content: 'Original content' });
    expect(sameContentPatch.draft.revision).toBe(1);
    expect(await getVariants(draft.id)).toEqual([
      expect.objectContaining({ sourceDraftRevision: 1, stale: false }),
    ]);
  });
});
