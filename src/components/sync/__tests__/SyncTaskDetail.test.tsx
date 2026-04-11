import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import type { SyncTask } from '@/lib/sync/types';

vi.mock('@/components/sync/sync.css', () => ({
  detailPanel: 'detailPanel',
  detailHeader: 'detailHeader',
  detailEyebrow: 'detailEyebrow',
  detailTitle: 'detailTitle',
  detailMeta: 'detailMeta',
  receiptList: 'receiptList',
  receiptCard: 'receiptCard',
  receiptHeader: 'receiptHeader',
  receiptPlatform: 'receiptPlatform',
  receiptStatus: 'receiptStatus',
  receiptMessage: 'receiptMessage',
  receiptLink: 'receiptLink',
  retryPanel: 'retryPanel',
  retryButton: 'retryButton',
  retryMessage: 'retryMessage',
}));

vi.mock('@/components/sync/SyncTaskRetryButton', () => ({
  default: ({ taskId }: { taskId: string }) => (
    <button type="button">重试失败平台 {taskId}</button>
  ),
}));

describe('SyncTaskDetail', () => {
  test('renders task status and per-platform receipts', async () => {
    const { default: SyncTaskDetail } = await import('@/components/sync/SyncTaskDetail');
    const syncTask: SyncTask = {
      id: 'sync-1',
      draftId: 'draft-1',
      title: 'AI 话题稿件',
      status: 'partial',
      createdAt: '2026-04-11T08:40:00.000Z',
      updatedAt: '2026-04-11T08:45:00.000Z',
      receipts: [
        {
          platform: 'wechat',
          status: 'published',
          message: '已发布到公众号',
          url: 'https://mp.weixin.qq.com/example',
          attempts: 1,
          updatedAt: '2026-04-11T08:41:00.000Z',
        },
        {
          platform: 'zhihu',
          status: 'failed',
          message: '知乎 Cookie 已过期',
          attempts: 2,
          updatedAt: '2026-04-11T08:45:00.000Z',
        },
      ],
    };

    render(createElement(SyncTaskDetail, { syncTask }));

    expect(screen.getByText('AI 话题稿件')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.textContent === '部分完成 · 2 个平台 · 更新于 2026年4月11日 16:45'
    ))).toBeInTheDocument();
    expect(screen.getByText('微信公众号')).toBeInTheDocument();
    expect(screen.getByText('已发布')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.textContent === '已发布到公众号 · 第 1 次尝试 · 2026年4月11日 16:41'
    ))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '打开平台结果' })).toHaveAttribute(
      'href',
      'https://mp.weixin.qq.com/example',
    );
    expect(screen.getByText('知乎')).toBeInTheDocument();
    expect(screen.getByText('失败')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.textContent === '知乎 Cookie 已过期 · 第 2 次尝试 · 2026年4月11日 16:45'
    ))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重试失败平台 sync-1' })).toBeInTheDocument();
  });
});
