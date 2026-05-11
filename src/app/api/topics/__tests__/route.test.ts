import { beforeEach, describe, expect, test } from 'vitest';

import { GET, POST } from '@/app/api/topics/route';
import { DELETE, GET as GET_BY_ID, PATCH } from '@/app/api/topics/[id]/route';
import { POST as POST_FROM_SIGNALS } from '@/app/api/topics/from-signals/route';
import { resetTopicRegistryForTests } from '@/lib/topics/registry';
import { resetSignalRegistryForTests, getSignalRegistry } from '@/lib/signals/registry';

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

describe('/api/topics', () => {
  beforeEach(() => {
    resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
  });

  test('creates and lists topics', async () => {
    const createResponse = await POST(
      createJsonRequest('http://localhost/api/topics', {
        title: 'AI 写作工具趋势',
        angle: '个人用户视角',
        tags: ['ai', 'writing'],
      }),
    );
    const createJson = await readJson(createResponse);

    expect(createResponse.status).toBe(201);
    expect(createJson.topic).toMatchObject({
      id: 'topic-1',
      title: 'AI 写作工具趋势',
      angle: '个人用户视角',
      status: 'idea',
      tags: ['ai', 'writing'],
    });

    const listResponse = await GET(new Request('http://localhost/api/topics'));
    const listJson = await readJson(listResponse);

    expect(listResponse.status).toBe(200);
    expect(listJson.topics).toHaveLength(1);
  });

  test('rejects topic creation without title', async () => {
    const response = await POST(createJsonRequest('http://localhost/api/topics', { title: '' }));
    expect(response.status).toBe(400);
    expect((await readJson(response)).error).toBe('标题不能为空');
  });

  test('filters topics by status', async () => {
    let idCount = 0;
    const store = resetTopicRegistryForTests({
      createId: () => `topic-${++idCount}`,
      now: () => '2026-05-10T01:00:00.000Z',
    });

    store.createTopic({ title: '选题1' });
    store.createTopic({ title: '选题2' });
    store.updateTopic('topic-1', { status: 'researching' });

    const response = await GET(new Request('http://localhost/api/topics?status=researching'));
    const json = await readJson(response);

    expect(json.topics).toHaveLength(1);
    expect(json.topics[0].id).toBe('topic-1');
  });

  test('returns 400 for invalid status', async () => {
    const response = await GET(new Request('http://localhost/api/topics?status=invalid'));
    expect(response.status).toBe(400);
  });
});

describe('/api/topics/[id]', () => {
  beforeEach(() => {
    const store = resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    store.createTopic({ title: '测试选题', angle: '测试角度' });
  });

  test('reads a topic by id', async () => {
    const context = { params: Promise.resolve({ id: 'topic-1' }) };
    const response = await GET_BY_ID(new Request('http://localhost/api/topics/topic-1'), context);
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.topic.title).toBe('测试选题');
  });

  test('updates topic fields', async () => {
    const context = { params: Promise.resolve({ id: 'topic-1' }) };
    const response = await PATCH(
      new Request('http://localhost/api/topics/topic-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '新标题',
          status: 'researching',
          tags: ['updated'],
        }),
      }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.topic).toMatchObject({
      title: '新标题',
      status: 'researching',
      tags: ['updated'],
    });
  });

  test('rejects invalid status transition', async () => {
    const store = resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    store.createTopic({ title: '选题' });
    store.updateTopic('topic-1', { status: 'published' });

    const context = { params: Promise.resolve({ id: 'topic-1' }) };
    const response = await PATCH(
      new Request('http://localhost/api/topics/topic-1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'idea' }),
      }),
      context,
    );

    expect(response.status).toBe(404);
  });

  test('archives topic on DELETE', async () => {
    const context = { params: Promise.resolve({ id: 'topic-1' }) };
    const response = await DELETE(
      new Request('http://localhost/api/topics/topic-1', { method: 'DELETE' }),
      context,
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.topic.status).toBe('archived');
  });

  test('returns 404 for non-existent topic', async () => {
    const context = { params: Promise.resolve({ id: 'missing' }) };
    const response = await GET_BY_ID(new Request('http://localhost/api/topics/missing'), context);
    expect(response.status).toBe(404);
  });
});

describe('/api/topics/from-signals', () => {
  beforeEach(() => {
    resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    const signalStore = resetSignalRegistryForTests({
      now: () => '2026-05-10T01:00:00.000Z',
    });
    signalStore.createSignal({
      sourceId: 'src-1',
      sourceType: 'rss',
      title: '信号标题A',
      summary: '信号摘要A',
      url: 'https://example.com/a',
      tags: ['ai'],
    });
    signalStore.createSignal({
      sourceId: 'src-2',
      sourceType: 'rss',
      title: '信号标题B',
      summary: '信号摘要B',
      url: 'https://example.com/b',
      tags: ['tech'],
    });
  });

  test('creates topic from signals and marks them converted', async () => {
    const signalRegistry = getSignalRegistry();
    const allSignals = signalRegistry.listSignals();
    const signalIds = allSignals.map((s) => s.id);

    const response = await POST_FROM_SIGNALS(
      createJsonRequest('http://localhost/api/topics/from-signals', { signalIds }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(201);
    expect(json.topic.signalIds).toHaveLength(2);
    expect(json.convertedSignalIds).toHaveLength(2);

    for (const id of signalIds) {
      const signal = signalRegistry.getSignal(id);
      expect(signal?.status).toBe('converted');
    }
  });

  test('rejects empty signalIds', async () => {
    const response = await POST_FROM_SIGNALS(
      createJsonRequest('http://localhost/api/topics/from-signals', { signalIds: [] }),
    );
    expect(response.status).toBe(400);
  });

  test('returns 404 when no valid signals found', async () => {
    const response = await POST_FROM_SIGNALS(
      createJsonRequest('http://localhost/api/topics/from-signals', {
        signalIds: ['non-existent-1', 'non-existent-2'],
      }),
    );
    expect(response.status).toBe(404);
  });
});
