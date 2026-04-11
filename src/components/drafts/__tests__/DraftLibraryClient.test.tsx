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
  editLink: 'editLink',
  statePanel: 'statePanel',
  emptyState: 'emptyState',
  emptyIcon: 'emptyIcon',
  stateTitle: 'stateTitle',
  stateText: 'stateText',
  primaryLink: 'primaryLink',
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
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          drafts: [
            {
              id: 'draft-1',
              title: 'AI 话题稿件',
              content: '这是一篇待同步的稿件正文。',
              status: 'ready',
              source: 'ai-news',
              createdAt: '2026-04-11T08:00:00.000Z',
              updatedAt: '2026-04-11T08:30:00.000Z',
            },
          ],
        }),
      }),
    );

    render(createElement(DraftLibraryClient));

    expect(await screen.findByText('AI 话题稿件')).toBeInTheDocument();
    expect(screen.getByText('待同步')).toBeInTheDocument();
    expect(screen.getByText('AI 选题')).toBeInTheDocument();
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
        json: async () => ({ drafts: [] }),
      }),
    );

    render(createElement(DraftLibraryClient));

    await waitFor(() => {
      expect(screen.getByText('还没有稿件')).toBeInTheDocument();
    });
  });
});
