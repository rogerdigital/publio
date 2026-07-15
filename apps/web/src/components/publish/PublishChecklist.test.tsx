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
  staleBadge: 'staleBadge',
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

function variant(
  draftId: string,
  id: string,
  content: string,
  overrides: Partial<PlatformVariant> = {},
): PlatformVariant {
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
    ...overrides,
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

  it('ignores a forced replacement response after switching drafts', async () => {
    const replacementResponse = deferred<Response>();
    const fetchMock = vi.fn((url: string, init?: { method?: string }) => {
      if (url === '/api/drafts/old-draft/variants' && !init?.method) {
        return Promise.resolve(responseWith([variant('old-draft', 'old-variant', 'old content')]));
      }
      if (url === '/api/drafts/old-draft/variants' && init?.method === 'POST') {
        return replacementResponse.promise;
      }
      if (url === '/api/drafts/new-draft/variants') {
        return Promise.resolve(responseWith([variant('new-draft', 'new-variant', 'new content')]));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist />);
    fireEvent.click(await screen.findByRole('button', { name: '同步' }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === '/api/drafts/old-draft/variants' && init?.method === 'POST',
        ),
      ).toBe(true),
    );

    act(() => usePublishStore.getState().setCurrentDraftId('new-draft'));
    await waitFor(() => expect(screen.getByDisplayValue('new content')).toBeTruthy());

    replacementResponse.resolve(
      responseWith([variant('old-draft', 'replacement-variant', 'replacement content')]),
    );
    await act(async () => {
      await replacementResponse.promise;
      await Promise.resolve();
    });

    expect(usePublishStore.getState().variantIds.wechat).toBe('new-variant');
    expect(screen.queryByDisplayValue('replacement content')).toBeNull();
    expect(screen.getByDisplayValue('new content')).toBeTruthy();
  });
});

describe('PublishChecklist stale variant replacement', () => {
  beforeEach(() => {
    usePublishStore.setState({
      title: 'Main title',
      content: 'Main content',
      currentDraftId: 'draft-1',
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

  it('shows stale freshness and replaces with one forced POST without PATCH', async () => {
    const staleVariant = variant('draft-1', 'stale-variant', 'stale content', {
      sourceDraftRevision: 1,
      stale: true,
    });
    const freshVariant = variant('draft-1', 'fresh-variant', 'fresh content', {
      sourceDraftRevision: 2,
      stale: false,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWith([staleVariant]))
      .mockResolvedValueOnce(responseWith([freshVariant]));
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist />);
    expect(await screen.findByText('主稿已更新')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '同步' }));

    await waitFor(() => expect(screen.getByDisplayValue('fresh content')).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toBe('/api/drafts/draft-1/variants');
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platforms: ['wechat'], force: true }),
    });
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
    expect(screen.queryByText('主稿已更新')).toBeNull();
    expect(usePublishStore.getState().variantIds.wechat).toBe('fresh-variant');
  });

  it.each([
    { manuallyEdited: true, generatedByAgent: false },
    { manuallyEdited: false, generatedByAgent: true },
  ])('does not replace a protected variant when confirmation is cancelled', async (flags) => {
    const protectedVariant = variant('draft-1', 'protected-variant', 'protected content', flags);
    const fetchMock = vi.fn().mockResolvedValueOnce(responseWith([protectedVariant]));
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', confirmMock);

    render(<PublishChecklist />);
    fireEvent.click(await screen.findByRole('button', { name: '同步' }));

    expect(confirmMock).toHaveBeenCalledWith(
      '重新生成会覆盖这个渠道版本的人工或 AI 修改，是否继续？',
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('replaces a protected variant after confirmation with one forced POST', async () => {
    const protectedVariant = variant('draft-1', 'protected-variant', 'protected content', {
      manuallyEdited: true,
    });
    const replacement = variant('draft-1', 'replacement', 'replacement content', {
      sourceDraftRevision: 2,
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(responseWith([protectedVariant]))
      .mockResolvedValueOnce(responseWith([replacement]));
    const confirmMock = vi.fn().mockReturnValue(true);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', confirmMock);

    render(<PublishChecklist />);
    fireEvent.click(await screen.findByRole('button', { name: '同步' }));

    await waitFor(() => expect(screen.getByDisplayValue('replacement content')).toBeTruthy());
    expect(confirmMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][1]?.body).toBe(
      JSON.stringify({ platforms: ['wechat'], force: true }),
    );
    expect(fetchMock.mock.calls.some(([, init]) => init?.method === 'PATCH')).toBe(false);
  });
});
