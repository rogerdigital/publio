import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import type { SyncTask } from '@/lib/sync/types';

vi.mock('@/components/sync/sync.css', () => ({
  historyList: 'historyList',
  historyCard: 'historyCard',
  historyTitle: 'historyTitle',
  historyMeta: 'historyMeta',
  historyLink: 'historyLink',
  emptyHistory: 'emptyHistory',
}));

describe('SyncTaskList', () => {
  test('renders sync tasks with links to details', async () => {
    const { default: SyncTaskList } = await import('@/components/sync/SyncTaskList');
    const tasks: SyncTask[] = [
      {
        id: 'sync-1',
        draftId: 'draft-1',
        title: '稿件标题',
        status: 'needs-action',
        createdAt: '2026-04-11T08:00:00.000Z',
        updatedAt: '2026-04-11T08:05:00.000Z',
        receipts: [
          {
            platform: 'xiaohongshu',
            status: 'needs-action',
            attempts: 1,
            updatedAt: '2026-04-11T08:05:00.000Z',
          },
        ],
      },
    ];

    render(createElement(SyncTaskList, { tasks }));

    expect(screen.getByText('稿件标题')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.textContent === '需要处理 · 1 个平台 · 更新于 2026年4月11日 16:05'
    ))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看分发详情' })).toHaveAttribute(
      'href',
      '/sync-tasks/sync-1',
    );
  });

  test('renders an empty state', async () => {
    const { default: SyncTaskList } = await import('@/components/sync/SyncTaskList');

    render(createElement(SyncTaskList, { tasks: [] }));

    expect(screen.getByText('还没有分发记录')).toBeInTheDocument();
  });
});
