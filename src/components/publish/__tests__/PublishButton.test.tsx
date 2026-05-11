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
vi.mock('@/components/publish/publishConfirm.css', () => ({}));
vi.mock('@/components/publish/PublishConfirmDialog', () => ({
  default: ({ open, onConfirm }: { open: boolean; onConfirm: () => void }) =>
    open ? createElement('button', { onClick: onConfirm }, '确认发布') : null,
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
    usePublishStore.getState().setCurrentDraftId('draft-42');
    usePublishStore.getState().setTitle('通用标题');
    usePublishStore.getState().setContent('通用正文');
    usePublishStore.getState().syncPlatformDrafts();
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        syncTaskId: 'sync-test-1',
        syncTask: { id: 'sync-test-1', status: 'pending', receipts: [], events: [] },
      }),
    });
    vi.stubGlobal('fetch', fetch);

    render(createElement(PublishButton));
    // 第一次点击：打开确认弹窗
    fireEvent.click(screen.getByRole('button', { name: '发布到 4 个平台' }));
    // 第二次点击：确认发布
    fireEvent.click(screen.getByText('确认发布'));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
    const publishCall = fetch.mock.calls.find((call) => call[0] === '/api/publish') as [
      string,
      RequestInit,
    ];
    const payload = JSON.parse(publishCall[1].body as string);

    expect(payload.draftId).toBe('draft-42');
    expect(payload.platformDrafts.wechat).toMatchObject({
      title: '通用标题',
      content: '通用正文',
    });
    expect(payload.platformDrafts.x).toMatchObject({
      title: '通用标题',
      content: '通用正文',
    });
  });
});
