import { afterEach, describe, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';

vi.mock('@/components/drafts/drafts.css', () => ({
  draftList: 'draftList',
  draftCard: 'draftCard',
  draftMetaRow: 'draftMetaRow',
  statusBadge: 'statusBadge',
  sourceBadge: 'sourceBadge',
  updatedTime: 'updatedTime',
  draftTitle: 'draftTitle',
  draftExcerpt: 'draftExcerpt',
  syncSummary: 'syncSummary',
  syncTitle: 'syncTitle',
  syncText: 'syncText',
  syncDetailLink: 'syncDetailLink',
  editLink: 'editLink',
  statePanel: 'statePanel',
  emptyState: 'emptyState',
  emptyIcon: 'emptyIcon',
  stateTitle: 'stateTitle',
  stateText: 'stateText',
  primaryLink: 'primaryLink',
  pageContent: 'pageContent',
  pipelineSection: 'pipelineSection',
  pipelineSectionTitle: 'pipelineSectionTitle',
  pipelineSectionDesc: 'pipelineSectionDesc',
  pipelineList: 'pipelineList',
  pipelineRow: 'pipelineRow',
  pipelineStep: 'pipelineStep',
  pipelineStepIcon: 'pipelineStepIcon',
  pipelineStepContent: 'pipelineStepContent',
  pipelineStepLabel: 'pipelineStepLabel',
  pipelineStepLink: 'pipelineStepLink',
  pipelineArrow: 'pipelineArrow',
}));

describe('DraftLibraryClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('loads and renders draft cards from the draft API', async () => {
    const { default: DraftLibraryClient } = await import(
      '@/components/drafts/DraftLibraryClient'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn((url) => Promise.resolve({
        ok: true,
        json: async () => url === '/api/sync-tasks'
          ? ({
            syncTasks: [
              {
                id: 'sync-1',
                draftId: 'draft-1',
                title: 'AI 话题稿件',
                status: 'partial',
                createdAt: '2026-04-11T00:00:00.000Z',
                updatedAt: '2026-04-11T00:00:00.000Z',
                receipts: [
                  { platform: 'wechat', status: 'published' },
                  { platform: 'zhihu', status: 'failed' },
                ],
              },
            ],
          })
          : ({
            drafts: [
              {
                id: 'draft-1',
                title: 'AI 话题稿件',
                content: '这是一篇待同步的稿件正文。',
                status: 'ready',
                source: 'ai-news',
                createdAt: '2026-04-11T00:00:00.000Z',
                updatedAt: '2026-04-11T00:00:00.000Z',
              },
            ],
          }),
      })),
    );

    render(createElement(DraftLibraryClient));

    // Title appears in both the pipeline section and the draft card
    await waitFor(() => {
      expect(screen.getAllByText('AI 话题稿件').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('待同步')).toBeInTheDocument();
    expect(screen.getByText('AI 选题')).toBeInTheDocument();
    expect(screen.getByText('最近分发：部分完成')).toBeInTheDocument();
    expect(screen.getByText((_, node) => (
      node?.textContent?.startsWith('2 个平台，更新于 2026年4月11日') === true
    ))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '查看分发详情' })).toHaveAttribute(
      'href',
      '/sync-tasks/sync-1',
    );
    expect(screen.getByRole('link', { name: '继续编辑 AI 话题稿件' })).toHaveAttribute(
      'href',
      '/?draftId=draft-1',
    );
  });

  test('shows an empty state when there are no drafts', async () => {
    const { default: DraftLibraryClient } = await import(
      '@/components/drafts/DraftLibraryClient'
    );
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ drafts: [], syncTasks: [] }),
      }),
    );

    render(createElement(DraftLibraryClient));

    await waitFor(() => {
      expect(screen.getByText('还没有稿件')).toBeInTheDocument();
    });
  });
});
