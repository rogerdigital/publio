import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import type { AnchorHTMLAttributes } from 'react';

import { usePublishStore } from '@/stores/publishStore';

vi.mock('next/link', () => ({
  default: ({ children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a {...props}>{children}</a>
  ),
}));

vi.mock('@/components/publish/PublishProgressOverlay.css', () => ({
  overlay: 'overlay',
  header: 'header',
  headerTitle: 'headerTitle',
  closeButton: 'closeButton',
  body: 'body',
  receiptRow: 'receiptRow',
  platformName: 'platformName',
  statusText: 'statusText',
  statusTextSuccess: 'statusTextSuccess',
  statusTextError: 'statusTextError',
  footer: 'footer',
  detailLink: 'detailLink',
}));

describe('PublishProgressOverlay', () => {
  beforeEach(() => {
    usePublishStore.setState(usePublishStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('settles global publish state when sync task reaches terminal receipts', async () => {
    const { default: PublishProgressOverlay } = await import('@/components/publish/PublishProgressOverlay');
    usePublishStore.setState({
      overallStatus: 'publishing',
      isProgressOverlayOpen: true,
      lastSyncTaskId: 'sync-1',
    });

    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        syncTask: {
          id: 'sync-1',
          title: '稿件标题',
          status: 'partial',
          createdAt: '2026-04-23T09:00:00.000Z',
          updatedAt: '2026-04-23T09:01:00.000Z',
          events: [],
          receipts: [
            {
              platform: 'wechat',
              status: 'published',
              message: '已发布',
              attempts: 1,
              updatedAt: '2026-04-23T09:01:00.000Z',
            },
            {
              platform: 'zhihu',
              status: 'failed',
              message: '原始错误',
              failureMessage: '发布失败',
              attempts: 1,
              updatedAt: '2026-04-23T09:01:00.000Z',
            },
          ],
        },
      }),
    });
    vi.stubGlobal('fetch', fetch);

    render(createElement(PublishProgressOverlay));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/sync-tasks/sync-1', { cache: 'no-store' });
    });

    await waitFor(() => {
      expect(usePublishStore.getState().overallStatus).toBe('error');
    });

    expect(usePublishStore.getState().results).toEqual([
      { platform: 'wechat', status: 'published', message: '已发布', url: undefined },
      { platform: 'zhihu', status: 'failed', message: '发布失败', url: undefined },
    ]);
  });
});
