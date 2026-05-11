import { beforeEach, describe, expect, test } from 'vitest';

import { GET as LIST_VARIANTS, POST as SYNC_VARIANTS } from '@/app/api/drafts/[id]/variants/route';
import {
  GET as GET_VARIANT,
  PATCH as PATCH_VARIANT,
  DELETE as DELETE_VARIANT,
} from '@/app/api/platform-variants/[id]/route';
import { resetPlatformVariantRegistryForTests } from '@/lib/platformVariants/registry';
import { resetDraftRegistryForTests } from '@/lib/drafts/registry';

function createJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function createPatchRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('/api/drafts/[id]/variants', () => {
  beforeEach(() => {
    let variantIdx = 0;
    resetPlatformVariantRegistryForTests({
      createId: () => `variant-${++variantIdx}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });
    const draftStore = resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    draftStore.createDraft({ title: '测试稿件', content: '正文内容', source: 'manual' });
  });

  test('returns 404 for non-existent draft', async () => {
    const res = await LIST_VARIANTS(
      new Request('http://localhost/api/drafts/none/variants'),
      makeParams('none'),
    );
    expect(res.status).toBe(404);
  });

  test('syncs and lists variants for a draft', async () => {
    const syncRes = await SYNC_VARIANTS(
      createJsonRequest('http://localhost/api/drafts/draft-1/variants', {
        platforms: ['wechat', 'zhihu'],
      }),
      makeParams('draft-1'),
    );
    const syncJson = await readJson(syncRes);

    expect(syncRes.status).toBe(201);
    expect(syncJson.variants).toHaveLength(2);
    expect(syncJson.variants[0].draftId).toBe('draft-1');

    const listRes = await LIST_VARIANTS(
      new Request('http://localhost/api/drafts/draft-1/variants'),
      makeParams('draft-1'),
    );
    const listJson = await readJson(listRes);
    expect(listJson.variants).toHaveLength(2);
  });
});

describe('/api/platform-variants/[id]', () => {
  let variantId: string;

  beforeEach(() => {
    const variantStore = resetPlatformVariantRegistryForTests({
      createId: () => 'variant-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });

    const v = variantStore.createVariant({
      draftId: 'draft-1',
      platform: 'wechat',
      title: '公众号标题',
      content: '公众号正文',
    });
    variantId = v.id;
  });

  test('gets variant by id', async () => {
    const res = await GET_VARIANT(
      new Request(`http://localhost/api/platform-variants/${variantId}`),
      makeParams(variantId),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.variant.platform).toBe('wechat');
  });

  test('returns 404 for non-existent variant', async () => {
    const res = await GET_VARIANT(
      new Request('http://localhost/api/platform-variants/none'),
      makeParams('none'),
    );
    expect(res.status).toBe(404);
  });

  test('patches variant content and marks as edited', async () => {
    const res = await PATCH_VARIANT(
      createPatchRequest(`http://localhost/api/platform-variants/${variantId}`, {
        content: '手动修改内容',
      }),
      makeParams(variantId),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.variant.content).toBe('手动修改内容');
    expect(json.variant.manuallyEdited).toBe(true);
    expect(json.variant.status).toBe('edited');
  });

  test('rejects invalid status', async () => {
    const res = await PATCH_VARIANT(
      createPatchRequest(`http://localhost/api/platform-variants/${variantId}`, {
        status: 'invalid',
      }),
      makeParams(variantId),
    );
    expect(res.status).toBe(400);
  });

  test('deletes variant', async () => {
    const res = await DELETE_VARIANT(
      new Request(`http://localhost/api/platform-variants/${variantId}`, { method: 'DELETE' }),
      makeParams(variantId),
    );
    expect(res.status).toBe(200);

    const getRes = await GET_VARIANT(
      new Request(`http://localhost/api/platform-variants/${variantId}`),
      makeParams(variantId),
    );
    expect(getRes.status).toBe(404);
  });

  test('saves adapted content with generatedByAgent flag', async () => {
    const adaptedContent = '经过 AI 优化的公众号内容，适合微信生态传播。';
    const res = await PATCH_VARIANT(
      createPatchRequest(`http://localhost/api/platform-variants/${variantId}`, {
        content: adaptedContent,
        status: 'adapted',
        generatedByAgent: true,
        manuallyEdited: false,
      }),
      makeParams(variantId),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.variant.content).toBe(adaptedContent);
    expect(json.variant.status).toBe('adapted');
    expect(json.variant.generatedByAgent).toBe(true);
    expect(json.variant.manuallyEdited).toBe(false);
  });

  test('adaptation failure does not modify existing variant', async () => {
    const getRes = await GET_VARIANT(
      new Request(`http://localhost/api/platform-variants/${variantId}`),
      makeParams(variantId),
    );
    const original = await readJson(getRes);

    const patchRes = await PATCH_VARIANT(
      createPatchRequest(`http://localhost/api/platform-variants/${variantId}`, {
        status: 'invalid_status',
      }),
      makeParams(variantId),
    );
    expect(patchRes.status).toBe(400);

    const afterRes = await GET_VARIANT(
      new Request(`http://localhost/api/platform-variants/${variantId}`),
      makeParams(variantId),
    );
    const after = await readJson(afterRes);
    expect(after.variant.content).toBe(original.variant.content);
    expect(after.variant.status).toBe(original.variant.status);
  });
});
