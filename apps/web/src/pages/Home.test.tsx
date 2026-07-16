import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { usePublishStore } from '@/stores/publishStore';
import HomePageClient from './Home';

const mocks = vi.hoisted(() => ({
  fetchDraftById: vi.fn(),
  invalidateSession: vi.fn(),
  syncSnapshot: vi.fn(),
  save: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/drafts/client', () => ({
  fetchDraftById: mocks.fetchDraftById,
}));

vi.mock('@/hooks/useManualSave', () => ({
  useManualSave: () => ({
    save: mocks.save,
    invalidateSession: mocks.invalidateSession,
    syncSnapshot: mocks.syncSnapshot,
  }),
}));

vi.mock('@/lib/navigationDataCache', () => ({
  getCachedHomePageChromeData: () => ({ agentEnabled: false }),
  loadHomePageChromeData: () => new Promise(() => {}),
}));

vi.mock('@/app/styles/layout.css', () => ({ scrollArea: 'scrollArea' }));
vi.mock('@/components/publish/publish.css', () => ({ rightPanelSection: 'rightPanelSection' }));
vi.mock('./page.css', () => ({
  pageWrap: 'pageWrap',
  headerActions: 'headerActions',
  tabSwitcher: 'tabSwitcher',
  tabButton: () => 'tabButton',
  moreMenuWrap: 'moreMenuWrap',
  newDraftButton: 'newDraftButton',
  moreMenuBackdrop: 'moreMenuBackdrop',
  moreMenu: 'moreMenu',
  moreMenuItem: 'moreMenuItem',
  moreMenuItemDanger: 'moreMenuItemDanger',
  editorLayout: 'editorLayout',
  mainContentArea: 'mainContentArea',
  editorSection: 'editorSection',
  draftLoadError: 'draftLoadError',
  mobileOnly: 'mobileOnly',
  editorCard: () => 'editorCard',
  publishPanel: 'publishPanel',
  confirmOverlay: 'confirmOverlay',
  confirmModal: 'confirmModal',
  confirmTitle: 'confirmTitle',
  confirmText: 'confirmText',
  confirmActions: 'confirmActions',
  confirmCancel: 'confirmCancel',
  confirmDanger: 'confirmDanger',
}));

vi.mock('@/components/layout/AppShellHeader', () => ({
  default: ({ action }: { action: React.ReactNode }) => <header>{action}</header>,
}));
vi.mock('@/components/editor/MarkdownEditor', () => ({ default: () => <div>editor</div> }));
vi.mock('@/components/editor/RecentDraftBar', () => ({ default: () => null }));
vi.mock('@/components/editor/MarkdownImportButton', () => ({ default: () => null }));
vi.mock('@/components/publish/PublishChecklist', () => ({ default: () => null }));
vi.mock('@/components/editor/TemplatePicker', () => ({ default: () => null }));
vi.mock('@/components/editor/MediaLibrary', () => ({ default: () => null }));
vi.mock('@/components/publish/PublishProgressOverlay', () => ({ default: () => null }));
vi.mock('@/components/agent/AgentPanel', () => ({ default: () => null }));

const draftB = {
  id: 'draft-b',
  title: 'Draft B',
  content: 'Content B',
  status: 'draft' as const,
  source: 'manual' as const,
  revision: 1,
  createdAt: '2026-07-16T00:00:00.000Z',
  updatedAt: '2026-07-16T00:00:00.000Z',
};

describe('Home draft save sessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchDraftById.mockResolvedValue(draftB);
    usePublishStore.setState({
      title: 'Draft A',
      content: 'Content A',
      currentDraftId: 'draft-a',
      activeTab: 'edit',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('invalidates the previous save session before fetching a URL-selected draft', async () => {
    render(
      <MemoryRouter
        initialEntries={['/?draftId=draft-b']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <HomePageClient />
      </MemoryRouter>,
    );

    await waitFor(() => expect(mocks.fetchDraftById).toHaveBeenCalledWith('draft-b'));
    expect(mocks.invalidateSession).toHaveBeenCalledTimes(1);
    expect(mocks.invalidateSession.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.fetchDraftById.mock.invocationCallOrder[0],
    );
    await waitFor(() =>
      expect(mocks.syncSnapshot).toHaveBeenCalledWith({ title: 'Draft B', content: 'Content B' }),
    );
  });

  it('starts a clean draft session when clearing an editor without a draft id', async () => {
    usePublishStore.setState({ currentDraftId: null });
    render(
      <MemoryRouter
        initialEntries={['/']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <HomePageClient />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByTitle('更多操作'));
    fireEvent.click(screen.getByRole('button', { name: '清空写作台' }));
    fireEvent.click(screen.getByRole('button', { name: '确认清空' }));

    expect(mocks.syncSnapshot).toHaveBeenCalledWith({ title: '', content: '' });
    expect(usePublishStore.getState()).toMatchObject({
      title: '',
      content: '',
      currentDraftId: null,
    });
  });
});
