import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import type { PlatformVariant } from '@/lib/platformVariants/types';
import { usePublishStore } from '@/stores/publishStore';
import PublishChecklist from './PublishChecklist';

vi.mock('./PlatformSelector', () => ({ default: () => null }));
vi.mock('./PublishButton', () => ({ default: () => null }));
vi.mock('./PublishStatusPanel', () => ({ default: () => null }));
vi.mock('./PlatformAdaptButton', () => ({ default: () => null }));
vi.mock('./PublishChecklist.css', () => ({
  checklist: 'checklist',
  step: 'step',
  stepHeader: 'stepHeader',
  stepNumber: 'stepNumber',
  stepTitle: 'stepTitle',
  stepContent: 'stepContent',
  platformCards: 'platformCards',
  variantCard: 'variantCard',
  cardHeader: 'cardHeader',
  cardHeaderLeft: 'cardHeaderLeft',
  cardPlatformName: 'cardPlatformName',
  readinessVariants: { ready: 'ready' },
  variantStatusBadge: { synced: 'synced' },
  platformReason: 'platformReason',
  cardMeta: 'cardMeta',
  metaTag: 'metaTag',
  changeSummary: 'changeSummary',
  titleInput: 'titleInput',
  contentArea: 'contentArea',
  validationList: 'validationList',
  passedHint: 'passedHint',
  cardActions: 'cardActions',
  actionBtn: 'actionBtn',
  wordCount: 'wordCount',
  publishAction: 'publishAction',
  failureGuidance: 'failureGuidance',
  failureItem: 'failureItem',
  failurePlatform: 'failurePlatform',
  failureMessage: 'failureMessage',
  resultLink: 'resultLink',
}));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function variant(draftId: string, id: string, content: string): PlatformVariant {
  return {
    id,
    draftId,
    platform: 'wechat',
    title: `${draftId} title`,
    content,
    status: 'synced',
    generatedByAgent: false,
    manuallyEdited: false,
    sourceDraftRevision: 1,
    stale: false,
    createdAt: '2026-07-16T00:00:00.000Z',
    updatedAt: '2026-07-16T00:00:00.000Z',
  };
}

function responseWith(variants: PlatformVariant[]) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({ variants }),
  } as unknown as Response;
}

describe('PublishChecklist draft switching', () => {
  beforeEach(() => {
    usePublishStore.setState({
      title: 'Main title',
      content: 'Main content',
      currentDraftId: 'old-draft',
      platforms: { wechat: true, xiaohongshu: false, zhihu: false, x: false },
      platformDrafts: adaptContentForPlatforms({
        title: 'Main title',
        content: 'Main content',
        platforms: ['wechat', 'xiaohongshu', 'zhihu', 'x'],
      }),
      variantIds: { wechat: null, xiaohongshu: null, zhihu: null, x: null },
      overallStatus: 'idle',
      results: [],
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('clears loaded variant and edit state as soon as the draft changes', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        responseWith([variant('old-draft', 'old-variant', 'old variant content')]),
      )
      .mockImplementation(() => new Promise(() => {}));
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist />);

    const oldContent = await screen.findByDisplayValue('old variant content');
    fireEvent.click(oldContent);
    expect(screen.getByDisplayValue('old-draft title')).toBeTruthy();
    expect(usePublishStore.getState().variantIds.wechat).toBe('old-variant');

    act(() => usePublishStore.getState().setCurrentDraftId('new-draft'));

    expect(usePublishStore.getState().variantIds.wechat).toBeNull();
    expect(screen.queryByDisplayValue('old-draft title')).toBeNull();
    expect(screen.queryByDisplayValue('old variant content')).toBeNull();
  });

  it('aborts and ignores an old variant response after switching drafts', async () => {
    const oldResponse = deferred<Response>();
    const newResponse = deferred<Response>();
    const fetchMock = vi.fn((url: string, _init?: { signal?: { aborted: boolean } }) => {
      if (url === '/api/drafts/old-draft/variants') return oldResponse.promise;
      if (url === '/api/drafts/new-draft/variants') return newResponse.promise;
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist />);
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === '/api/drafts/old-draft/variants')).toBe(
        true,
      );
    });
    const oldSignal = fetchMock.mock.calls[0][1]?.signal;

    act(() => usePublishStore.getState().setCurrentDraftId('new-draft'));
    await waitFor(() => {
      expect(fetchMock.mock.calls.some(([url]) => url === '/api/drafts/new-draft/variants')).toBe(
        true,
      );
    });
    expect(oldSignal?.aborted).toBe(true);

    newResponse.resolve(responseWith([variant('new-draft', 'new-variant', 'new content')]));
    await waitFor(() => expect(usePublishStore.getState().variantIds.wechat).toBe('new-variant'));
    expect(screen.getByDisplayValue('new content')).toBeTruthy();

    oldResponse.resolve(responseWith([variant('old-draft', 'old-variant', 'old content')]));
    await act(async () => {
      await oldResponse.promise;
      await Promise.resolve();
    });

    expect(usePublishStore.getState().variantIds.wechat).toBe('new-variant');
    expect(screen.queryByDisplayValue('old content')).toBeNull();
    expect(screen.getByDisplayValue('new content')).toBeTruthy();
  });
});
