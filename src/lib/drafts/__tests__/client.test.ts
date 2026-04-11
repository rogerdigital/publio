import { afterEach, describe, expect, test, vi } from 'vitest';

import { createDraft, fetchDraftById } from '@/lib/drafts/client';

describe('fetchDraftById', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('loads a draft by id from the draft API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          draft: {
            id: 'draft-1',
            title: '稿件标题',
            content: '稿件正文',
            status: 'draft',
            source: 'manual',
            createdAt: '2026-04-11T08:00:00.000Z',
            updatedAt: '2026-04-11T08:00:00.000Z',
          },
        }),
      }),
    );

    await expect(fetchDraftById('draft-1')).resolves.toMatchObject({
      id: 'draft-1',
      title: '稿件标题',
      content: '稿件正文',
    });
    expect(fetch).toHaveBeenCalledWith('/api/drafts/draft-1', { cache: 'no-store' });
  });

  test('throws a readable error when the draft cannot be loaded', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: '稿件不存在' }),
      }),
    );

    await expect(fetchDraftById('missing')).rejects.toThrow('稿件不存在');
  });

  test('creates a draft through the draft API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          draft: {
            id: 'draft-2',
            title: '选题稿件',
            content: '研究底稿',
            status: 'draft',
            source: 'ai-news',
            createdAt: '2026-04-11T08:00:00.000Z',
            updatedAt: '2026-04-11T08:00:00.000Z',
          },
        }),
      }),
    );

    await expect(
      createDraft({
        title: '选题稿件',
        content: '研究底稿',
        source: 'ai-news',
      }),
    ).resolves.toMatchObject({
      id: 'draft-2',
      source: 'ai-news',
    });
    expect(fetch).toHaveBeenCalledWith('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '选题稿件',
        content: '研究底稿',
        source: 'ai-news',
      }),
    });
  });
});
