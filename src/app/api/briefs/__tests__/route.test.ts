import { beforeEach, describe, expect, test } from 'vitest';

import { GET as LIST_BRIEFS, POST as CREATE_BRIEF } from '@/app/api/briefs/route';
import {
  GET as GET_BRIEF,
  PATCH as PATCH_BRIEF,
  DELETE as DELETE_BRIEF,
} from '@/app/api/briefs/[id]/route';
import {
  GET as GET_TOPIC_BRIEF,
  POST as CREATE_TOPIC_BRIEF,
} from '@/app/api/topics/[id]/brief/route';
import { resetBriefRegistryForTests } from '@/lib/briefs/registry';
import { resetTopicRegistryForTests } from '@/lib/topics/registry';
import { resetSignalRegistryForTests } from '@/lib/signals/registry';

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

describe('/api/briefs', () => {
  let topicStore: ReturnType<typeof resetTopicRegistryForTests>;
  let signalStore: ReturnType<typeof resetSignalRegistryForTests>;

  beforeEach(() => {
    signalStore = resetSignalRegistryForTests({
      createId: () => 'sig-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    topicStore = resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    resetBriefRegistryForTests({
      createId: () => 'brief-1',
      now: () => '2026-05-10T01:00:00.000Z',
      topicLookup: topicStore,
    });

    topicStore.createTopic({ title: '测试选题', signalIds: ['sig-1'] });
    signalStore.createSignal({
      title: '测试信号',
      summary: '测试信号概述',
      sourceType: 'rss',
      sourceId: 'src-1',
      url: 'https://example.com/signal',
    });
  });

  test('creates and lists briefs', async () => {
    const createRes = await CREATE_BRIEF(
      createJsonRequest('http://localhost/api/briefs', {
        topicId: 'topic-1',
        workingTitle: '写作 Brief',
        thesis: '核心观点',
      }),
    );
    const createJson = await readJson(createRes);

    expect(createRes.status).toBe(201);
    expect(createJson.brief).toMatchObject({
      id: 'brief-1',
      topicId: 'topic-1',
      workingTitle: '写作 Brief',
      thesis: '核心观点',
    });

    const listRes = await LIST_BRIEFS(new Request('http://localhost/api/briefs'));
    const listJson = await readJson(listRes);

    expect(listRes.status).toBe(200);
    expect(listJson.briefs).toHaveLength(1);
  });

  test('rejects brief without topicId', async () => {
    const res = await CREATE_BRIEF(
      createJsonRequest('http://localhost/api/briefs', { topicId: '' }),
    );
    expect(res.status).toBe(400);
    expect((await readJson(res)).error).toBe('topicId 不能为空');
  });

  test('rejects brief when topic does not exist', async () => {
    const res = await CREATE_BRIEF(
      createJsonRequest('http://localhost/api/briefs', { topicId: 'topic-nonexistent' }),
    );
    expect(res.status).toBe(500);
    const json = await readJson(res);
    expect(json.error).toContain('不存在');
  });

  test('filters briefs by topicId', async () => {
    await CREATE_BRIEF(createJsonRequest('http://localhost/api/briefs', { topicId: 'topic-1' }));

    const filteredRes = await LIST_BRIEFS(
      new Request('http://localhost/api/briefs?topicId=topic-1'),
    );
    const filteredJson = await readJson(filteredRes);
    expect(filteredJson.briefs).toHaveLength(1);

    const emptyRes = await LIST_BRIEFS(
      new Request('http://localhost/api/briefs?topicId=topic-other'),
    );
    const emptyJson = await readJson(emptyRes);
    expect(emptyJson.briefs).toHaveLength(0);
  });

  test('gets brief by id', async () => {
    await CREATE_BRIEF(
      createJsonRequest('http://localhost/api/briefs', {
        topicId: 'topic-1',
        workingTitle: '标题',
      }),
    );

    const res = await GET_BRIEF(
      new Request('http://localhost/api/briefs/brief-1'),
      makeParams('brief-1'),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.brief.workingTitle).toBe('标题');
  });

  test('returns 404 for non-existent brief', async () => {
    const res = await GET_BRIEF(
      new Request('http://localhost/api/briefs/none'),
      makeParams('none'),
    );
    expect(res.status).toBe(404);
  });

  test('patches brief fields', async () => {
    await CREATE_BRIEF(createJsonRequest('http://localhost/api/briefs', { topicId: 'topic-1' }));

    const res = await PATCH_BRIEF(
      createPatchRequest('http://localhost/api/briefs/brief-1', {
        workingTitle: '更新标题',
        outline: [{ heading: '引言', purpose: '铺垫', evidenceSignalIds: [] }],
      }),
      makeParams('brief-1'),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.brief.workingTitle).toBe('更新标题');
    expect(json.brief.outline).toHaveLength(1);
  });

  test('deletes brief', async () => {
    await CREATE_BRIEF(createJsonRequest('http://localhost/api/briefs', { topicId: 'topic-1' }));

    const res = await DELETE_BRIEF(
      new Request('http://localhost/api/briefs/brief-1', { method: 'DELETE' }),
      makeParams('brief-1'),
    );
    expect(res.status).toBe(200);

    const getRes = await GET_BRIEF(
      new Request('http://localhost/api/briefs/brief-1'),
      makeParams('brief-1'),
    );
    expect(getRes.status).toBe(404);
  });
});

describe('/api/topics/[id]/brief', () => {
  let topicStore: ReturnType<typeof resetTopicRegistryForTests>;

  beforeEach(() => {
    resetSignalRegistryForTests({
      createId: () => 'sig-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    topicStore = resetTopicRegistryForTests({
      createId: () => 'topic-1',
      now: () => '2026-05-10T01:00:00.000Z',
    });
    resetBriefRegistryForTests({
      createId: () => 'brief-1',
      now: () => '2026-05-10T01:00:00.000Z',
      topicLookup: topicStore,
    });

    topicStore.createTopic({ title: '选题', signalIds: ['sig-1'] });
  });

  test('returns 404 when topic has no brief', async () => {
    const res = await GET_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief'),
      makeParams('topic-1'),
    );
    expect(res.status).toBe(404);
  });

  test('returns 404 when topic does not exist', async () => {
    const res = await GET_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/none/brief'),
      makeParams('none'),
    );
    expect(res.status).toBe(404);
  });

  test('creates default brief from topic and transitions status to briefed', async () => {
    const res = await CREATE_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief', { method: 'POST' }),
      makeParams('topic-1'),
    );
    const json = await readJson(res);

    expect(res.status).toBe(201);
    expect(json.brief.topicId).toBe('topic-1');
    expect(json.brief.workingTitle).toBe('选题');
    expect(json.created).toBe(true);

    const topic = topicStore.getTopic('topic-1');
    expect(topic?.status).toBe('briefed');
  });

  test('returns existing brief without creating duplicate', async () => {
    await CREATE_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief', { method: 'POST' }),
      makeParams('topic-1'),
    );

    const res = await CREATE_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief', { method: 'POST' }),
      makeParams('topic-1'),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.created).toBe(false);
  });

  test('GET returns brief after creation', async () => {
    await CREATE_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief', { method: 'POST' }),
      makeParams('topic-1'),
    );

    const res = await GET_TOPIC_BRIEF(
      new Request('http://localhost/api/topics/topic-1/brief'),
      makeParams('topic-1'),
    );
    const json = await readJson(res);

    expect(res.status).toBe(200);
    expect(json.brief.topicId).toBe('topic-1');
  });
});
