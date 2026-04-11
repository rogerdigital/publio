import { afterEach, describe, expect, test, vi } from 'vitest';

import { fetchDraftById } from '@/lib/drafts/client';

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
});
