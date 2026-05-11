import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockData: unknown[] = [];

vi.mock('@/lib/storage/jsonFileCollection', () => ({
  readJsonFileCollection: () => [...mockData],
  writeMergedJsonFileCollection: (_path: string, data: unknown[]) => {
    mockData.length = 0;
    mockData.push(...data);
  },
}));

vi.mock('@/lib/storage/localDataPath', () => ({
  createLocalDataPath: (name: string) => `/tmp/test-${name}`,
}));

import { GET, POST } from '@/app/api/feedback/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/feedback/[id]/route';

function createJsonRequest(url: string, body: unknown) {
  return new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/feedback', () => {
  beforeEach(() => {
    mockData.length = 0;
  });

  test('POST creates feedback with valid input', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-1',
        platform: 'wechat',
        summary: '表现良好',
        topicId: 'topic-1',
      }),
    );
    const json = await readJson(response);
    expect(response.status).toBe(201);
    expect(json.feedback.draftId).toBe('draft-1');
    expect(json.feedback.platform).toBe('wechat');
    expect(json.feedback.summary).toBe('表现良好');
    expect(json.feedback.source).toBe('manual');
  });

  test('POST rejects empty draftId', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: '',
        platform: 'wechat',
        summary: 'test',
      }),
    );
    expect(response.status).toBe(400);
  });

  test('POST rejects invalid platform', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-1',
        platform: 'invalid',
        summary: 'test',
      }),
    );
    expect(response.status).toBe(400);
  });

  test('GET lists feedback with filters', async () => {
    await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-1',
        platform: 'wechat',
        summary: 'A',
      }),
    );
    await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-2',
        platform: 'x',
        summary: 'B',
      }),
    );

    const allRes = await GET(new Request('http://localhost/api/feedback'));
    const allJson = await readJson(allRes);
    expect(allJson.feedback).toHaveLength(2);

    const filtered = await GET(new Request('http://localhost/api/feedback?draftId=draft-1'));
    const filteredJson = await readJson(filtered);
    expect(filteredJson.feedback).toHaveLength(1);
    expect(filteredJson.feedback[0].draftId).toBe('draft-1');
  });

  test('GET by id returns feedback', async () => {
    const createRes = await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-1',
        platform: 'wechat',
        summary: 'test',
      }),
    );
    const { feedback } = await readJson(createRes);

    const res = await GET_BY_ID(new Request(`http://localhost/api/feedback/${feedback.id}`), {
      params: Promise.resolve({ id: feedback.id }),
    });
    const json = await readJson(res);
    expect(json.feedback.id).toBe(feedback.id);
  });

  test('GET by id returns 404 for non-existent', async () => {
    const res = await GET_BY_ID(new Request('http://localhost/api/feedback/nope'), {
      params: Promise.resolve({ id: 'nope' }),
    });
    expect(res.status).toBe(404);
  });

  test('PATCH updates feedback', async () => {
    const createRes = await POST(
      createJsonRequest('http://localhost/api/feedback', {
        draftId: 'draft-1',
        platform: 'wechat',
        summary: 'original',
      }),
    );
    const { feedback } = await readJson(createRes);

    const patchRes = await PATCH(
      createJsonRequest(`http://localhost/api/feedback/${feedback.id}`, {
        summary: 'updated',
      }),
      { params: Promise.resolve({ id: feedback.id }) },
    );
    const json = await readJson(patchRes);
    expect(json.feedback.summary).toBe('updated');
  });
});
