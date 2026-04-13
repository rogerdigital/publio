import { beforeEach, describe, expect, test } from 'vitest';

import { GET, POST } from '@/app/api/drafts/route';
import {
  DELETE,
  GET as GET_BY_ID,
  PATCH,
} from '@/app/api/drafts/[id]/route';
import { resetDraftRegistryForTests } from '@/lib/drafts/registry';

function createJsonRequest(body: unknown) {
  return new Request('http://localhost/api/drafts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/drafts', () => {
  beforeEach(() => {
    resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-04-11T08:00:00.000Z',
    });
  });

  test('creates and lists drafts', async () => {
    const createResponse = await POST(
      createJsonRequest({
        title: '稿件标题',
        content: '稿件正文',
        source: 'manual',
      }),
    );
    const createJson = await readJson(createResponse);

    expect(createResponse.status).toBe(201);
    expect(createJson.draft).toMatchObject({
      id: 'draft-1',
      title: '稿件标题',
      content: '稿件正文',
      status: 'draft',
      source: 'manual',
    });

    const listResponse = await GET();
    const listJson = await readJson(listResponse);

    expect(listResponse.status).toBe(200);
    expect(listJson.drafts).toEqual([createJson.draft]);
  });

  test('rejects draft creation without title or content', async () => {
    const response = await POST(
      createJsonRequest({
        title: '',
        content: '',
        source: 'manual',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('标题和内容不能为空');
  });
});

describe('/api/drafts/[id]', () => {
  beforeEach(async () => {
    resetDraftRegistryForTests({
      createId: () => 'draft-1',
      now: () => '2026-04-11T08:00:00.000Z',
    });
    await POST(
      createJsonRequest({
        title: '稿件标题',
        content: '稿件正文',
        source: 'manual',
      }),
    );
  });

  test('reads, updates, and archives a draft', async () => {
    const context = { params: Promise.resolve({ id: 'draft-1' }) };

    const readResponse = await GET_BY_ID(
      new Request('http://localhost/api/drafts/draft-1'),
      context,
    );
    expect(readResponse.status).toBe(200);
    expect((await readJson(readResponse)).draft.title).toBe('稿件标题');

    const updateResponse = await PATCH(
      createJsonRequest({
        title: '新标题',
        content: '新正文',
        status: 'ready',
      }),
      context,
    );
    const updateJson = await readJson(updateResponse);

    expect(updateResponse.status).toBe(200);
    expect(updateJson.draft).toMatchObject({
      id: 'draft-1',
      title: '新标题',
      content: '新正文',
      status: 'ready',
    });

    const archiveResponse = await DELETE(
      new Request('http://localhost/api/drafts/draft-1', { method: 'DELETE' }),
      context,
    );
    const archiveJson = await readJson(archiveResponse);

    expect(archiveResponse.status).toBe(200);
    expect(archiveJson.draft.status).toBe('archived');
  });

  test('returns 404 for a missing draft', async () => {
    const context = { params: Promise.resolve({ id: 'missing' }) };

    const response = await GET_BY_ID(
      new Request('http://localhost/api/drafts/missing'),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(404);
    expect(json.error).toBe('稿件不存在');
  });
});
