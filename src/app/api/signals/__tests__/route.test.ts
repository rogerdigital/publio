import { beforeEach, describe, expect, test } from 'vitest';

import { GET, POST } from '@/app/api/signals/route';
import { DELETE, GET as GET_BY_ID, PATCH } from '@/app/api/signals/[id]/route';
import { resetSignalRegistryForTests } from '@/lib/signals/registry';

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

describe('/api/signals', () => {
  beforeEach(() => {
    resetSignalRegistryForTests({
      createId: () => 'sig-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
  });

  test('creates a signal with required fields', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/signals', {
        title: 'OpenAI 发布新模型',
        summary: '新模型能力更强',
        url: 'https://example.com/article',
        sourceType: 'manual',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(201);
    expect(json.signal).toMatchObject({
      id: 'sig-1',
      title: 'OpenAI 发布新模型',
      summary: '新模型能力更强',
      url: 'https://example.com/article',
      sourceType: 'manual',
      status: 'new',
    });
  });

  test('rejects signal creation without title', async () => {
    const response = await POST(
      createJsonRequest('http://localhost/api/signals', {
        title: '',
        summary: '摘要',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('标题不能为空');
  });

  test('lists signals sorted by capturedAt desc', async () => {
    let idCount = 0;
    const timestamps = ['2026-05-10T01:00:00.000Z', '2026-05-10T03:00:00.000Z'];
    let tsIndex = 0;
    resetSignalRegistryForTests({
      createId: () => `sig-${++idCount}`,
      now: () => timestamps[tsIndex++] ?? '2026-05-10T05:00:00.000Z',
    });

    await POST(
      createJsonRequest('http://localhost/api/signals', {
        title: '第一条',
        summary: '摘要1',
      }),
    );
    await POST(
      createJsonRequest('http://localhost/api/signals', {
        title: '第二条',
        summary: '摘要2',
      }),
    );

    const response = await GET(new Request('http://localhost/api/signals'));
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.signals).toHaveLength(2);
    expect(json.signals[0].id).toBe('sig-2');
    expect(json.signals[1].id).toBe('sig-1');
  });

  test('filters signals by status', async () => {
    let callCount = 0;
    const store = resetSignalRegistryForTests({
      createId: () => `sig-${++callCount}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });

    store.createSignal({ sourceId: 's1', sourceType: 'rss', title: '标题1', summary: '摘要1' });
    store.createSignal({ sourceId: 's2', sourceType: 'rss', title: '标题2', summary: '摘要2' });
    store.updateSignal('sig-1', { status: 'saved' });

    const response = await GET(new Request('http://localhost/api/signals?status=saved'));
    const json = await readJson(response);

    expect(json.signals).toHaveLength(1);
    expect(json.signals[0].id).toBe('sig-1');
  });

  test('filters signals by tag', async () => {
    let callCount = 0;
    const store = resetSignalRegistryForTests({
      createId: () => `sig-${++callCount}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });

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

    const response = await GET(new Request('http://localhost/api/signals?tag=ai'));
    const json = await readJson(response);

    expect(json.signals).toHaveLength(1);
    expect(json.signals[0].id).toBe('sig-1');
  });

  test('filters signals by sourceId', async () => {
    let callCount = 0;
    const store = resetSignalRegistryForTests({
      createId: () => `sig-${++callCount}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });

    store.createSignal({ sourceId: 'src-a', sourceType: 'rss', title: '标题1', summary: '摘要1' });
    store.createSignal({ sourceId: 'src-b', sourceType: 'rss', title: '标题2', summary: '摘要2' });

    const response = await GET(new Request('http://localhost/api/signals?sourceId=src-a'));
    const json = await readJson(response);

    expect(json.signals).toHaveLength(1);
    expect(json.signals[0].id).toBe('sig-1');
  });

  test('filters signals by keyword search', async () => {
    let callCount = 0;
    const store = resetSignalRegistryForTests({
      createId: () => `sig-${++callCount}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });

    store.createSignal({
      sourceId: 's1',
      sourceType: 'rss',
      title: 'OpenAI GPT-5',
      summary: '摘要',
    });
    store.createSignal({
      sourceId: 's2',
      sourceType: 'rss',
      title: 'Apple Vision',
      summary: '摘要',
    });

    const response = await GET(new Request('http://localhost/api/signals?q=openai'));
    const json = await readJson(response);

    expect(json.signals).toHaveLength(1);
    expect(json.signals[0].id).toBe('sig-1');
  });

  test('returns 400 for invalid status parameter', async () => {
    const response = await GET(new Request('http://localhost/api/signals?status=invalid'));
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('无效的 status 参数');
  });
});

describe('/api/signals/[id]', () => {
  beforeEach(() => {
    const store = resetSignalRegistryForTests({
      createId: () => 'sig-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    store.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '测试信号',
      summary: '测试摘要',
      url: 'https://example.com/test',
    });
  });

  test('reads a signal by id', async () => {
    const context = { params: Promise.resolve({ id: 'sig-1' }) };
    const response = await GET_BY_ID(new Request('http://localhost/api/signals/sig-1'), context);
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.signal).toMatchObject({
      id: 'sig-1',
      title: '测试信号',
      status: 'new',
    });
  });

  test('updates signal status', async () => {
    const context = { params: Promise.resolve({ id: 'sig-1' }) };
    const response = await PATCH(
      new Request('http://localhost/api/signals/sig-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'saved' }),
      }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.signal.status).toBe('saved');
  });

  test('updates signal tags and notes', async () => {
    const context = { params: Promise.resolve({ id: 'sig-1' }) };
    const response = await PATCH(
      new Request('http://localhost/api/signals/sig-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: ['ai', 'hot'], notes: '值得关注' }),
      }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.signal.tags).toEqual(['ai', 'hot']);
    expect(json.signal.notes).toBe('值得关注');
  });

  test('rejects invalid status value', async () => {
    const context = { params: Promise.resolve({ id: 'sig-1' }) };
    const response = await PATCH(
      new Request('http://localhost/api/signals/sig-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid' }),
      }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('无效的 status 值');
  });

  test('deletes a signal', async () => {
    const context = { params: Promise.resolve({ id: 'sig-1' }) };
    const response = await DELETE(
      new Request('http://localhost/api/signals/sig-1', { method: 'DELETE' }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.deleted).toBe(true);

    const getResponse = await GET_BY_ID(new Request('http://localhost/api/signals/sig-1'), context);
    expect(getResponse.status).toBe(404);
  });

  test('returns 404 for non-existent signal', async () => {
    const context = { params: Promise.resolve({ id: 'non-existent' }) };

    const response = await GET_BY_ID(
      new Request('http://localhost/api/signals/non-existent'),
      context,
    );
    expect(response.status).toBe(404);
    expect((await readJson(response)).error).toBe('信号不存在');
  });

  test('returns 404 when deleting non-existent signal', async () => {
    const context = { params: Promise.resolve({ id: 'non-existent' }) };
    const response = await DELETE(
      new Request('http://localhost/api/signals/non-existent', { method: 'DELETE' }),
      context,
    );
    expect(response.status).toBe(404);
  });
});
