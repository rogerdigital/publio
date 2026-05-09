import { readFile, writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { GET, PUT } from '@/app/api/settings/route';

const fsMocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
}));

vi.mock('fs/promises', () => ({
  readFile: fsMocks.readFile,
  writeFile: fsMocks.writeFile,
  default: fsMocks,
}));

function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function readJson(response: Response) {
  return response.json() as Promise<any>;
}

describe('/api/settings', () => {
  beforeEach(() => {
    vi.mocked(readFile).mockReset();
    vi.mocked(writeFile).mockReset();
  });

  test('returns only supported settings and masks secrets', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(
      [
        'AGENT_MODEL=deepseek-chat',
        'AGENT_API_KEY=secret-value',
        'UNRELATED_SECRET=should-not-leak',
      ].join('\n'),
    );

    const response = await GET();
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      ok: true,
      AGENT_MODEL: 'deepseek-chat',
      AGENT_API_KEY: '****alue',
    });
    expect(json.UNRELATED_SECRET).toBeUndefined();
  });

  test('updates allowed keys and preserves masked secrets', async () => {
    vi.mocked(readFile).mockResolvedValueOnce(
      ['AGENT_MODEL=old-model', 'AGENT_API_KEY=secret-value'].join('\n'),
    );

    const response = await PUT(
      createJsonRequest({
        AGENT_MODEL: 'new-model',
        AGENT_API_KEY: '****alue',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(writeFile).toHaveBeenCalledTimes(1);
    const [, content] = vi.mocked(writeFile).mock.calls[0];
    expect(content).toContain('AGENT_MODEL=new-model');
    expect(content).toContain('AGENT_API_KEY=secret-value');
  });

  test('rejects unsupported setting keys', async () => {
    const response = await PUT(
      createJsonRequest({
        AGENT_MODEL: 'deepseek-chat',
        UNSUPPORTED_KEY: 'value',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('不支持的设置项: UNSUPPORTED_KEY');
    expect(writeFile).not.toHaveBeenCalled();
  });

  test('rejects non-string setting values', async () => {
    const response = await PUT(
      createJsonRequest({
        AGENT_MAX_TOKENS: 2048,
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('设置项 AGENT_MAX_TOKENS 必须是字符串');
    expect(writeFile).not.toHaveBeenCalled();
  });

  test('validates bounded numeric settings', async () => {
    const response = await PUT(
      createJsonRequest({
        AGENT_TEMPERATURE: '3',
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('AGENT_TEMPERATURE 必须在 0 到 2 之间');
    expect(writeFile).not.toHaveBeenCalled();
  });
});
