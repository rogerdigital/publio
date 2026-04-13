import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

import { usePublishStore } from '@/stores/publishStore';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/components/publish/publish.css', () => ({
  publishButton: () => 'publishButton',
}));

describe('PublishButton', () => {
  beforeEach(() => {
    usePublishStore.setState(usePublishStore.getInitialState(), true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('sends platform-level draft content in the publish request', async () => {
    const { default: PublishButton } = await import('@/components/publish/PublishButton');
    usePublishStore.getState().setTitle('通用标题');
    usePublishStore.getState().setContent('通用正文');
    usePublishStore.getState().syncPlatformDrafts();
    usePublishStore.getState().updatePlatformDraft('wechat', {
      title: '公众号标题',
      body: '公众号正文',
    });
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        syncTaskId: 'sync-test-1',
        syncTask: { id: 'sync-test-1', status: 'pending', receipts: [], events: [] },
      }),
    });
    vi.stubGlobal('fetch', fetch);

    render(createElement(PublishButton));
    fireEvent.click(screen.getByRole('button', { name: '发布到 4 个平台' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [, init] = fetch.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(init.body as string);

    expect(payload.platformDrafts.wechat).toMatchObject({
      title: '公众号标题',
      content: '公众号正文',
    });
    expect(payload.platformDrafts.x).toMatchObject({
      title: '通用标题',
      content: '通用正文',
    });
  });
});
