import { afterEach, describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

const refresh = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock('@/components/sync/sync.css', () => ({
  inlineActionButton: 'inlineActionButton',
  inlineActionMessage: 'inlineActionMessage',
}));

describe('SyncTaskMarkDoneButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    refresh.mockReset();
  });

  test('posts the platform mark-done request and refreshes', async () => {
    const { default: SyncTaskMarkDoneButton } = await import(
      '@/components/sync/SyncTaskMarkDoneButton'
    );
    const fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ syncTask: { id: 'sync-1' } }),
    });
    vi.stubGlobal('fetch', fetch);

    render(createElement(SyncTaskMarkDoneButton, {
      taskId: 'sync-1',
      platform: 'xiaohongshu',
    }));
    fireEvent.click(screen.getByRole('button', { name: '标记已完成' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/sync-tasks/sync-1/mark-done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: 'xiaohongshu' }),
      });
      expect(refresh).toHaveBeenCalled();
    });
    expect(screen.getByText('已标记完成，正在刷新分发详情。')).toBeInTheDocument();
  });
});
