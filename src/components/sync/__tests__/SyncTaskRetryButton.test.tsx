import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock('@/components/sync/sync.css', () => ({
  retryPanel: 'retryPanel',
  retryButton: 'retryButton',
  retryMessage: 'retryMessage',
}));

describe('SyncTaskRetryButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    refresh.mockReset();
  });

  test('posts to the retry endpoint and refreshes the page', async () => {
    const { default: SyncTaskRetryButton } = await import(
      '@/components/sync/SyncTaskRetryButton'
    );
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ syncTask: { id: 'sync-1' } }),
    });
    vi.stubGlobal('fetch', fetch);

    render(createElement(SyncTaskRetryButton, { taskId: 'sync-1' }));
    fireEvent.click(screen.getByRole('button', { name: '重试失败平台' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/sync-tasks/sync-1/retry', {
        method: 'POST',
      });
      expect(refresh).toHaveBeenCalled();
    });
    expect(screen.getByText('重试已完成，正在刷新分发详情。')).toBeInTheDocument();
  });

  test('shows the retry API error message', async () => {
    const { default: SyncTaskRetryButton } = await import(
      '@/components/sync/SyncTaskRetryButton'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: '没有可重试的平台' }),
      }),
    );

    render(createElement(SyncTaskRetryButton, { taskId: 'sync-1' }));
    fireEvent.click(screen.getByRole('button', { name: '重试失败平台' }));

    expect(await screen.findByText('没有可重试的平台')).toBeInTheDocument();
    expect(refresh).not.toHaveBeenCalled();
  });
});
