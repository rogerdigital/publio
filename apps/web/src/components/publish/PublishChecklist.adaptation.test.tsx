import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import type { PlatformVariant } from '@/lib/platformVariants/types';
import { usePublishStore } from '@/stores/publishStore';
import PublishChecklist from './PublishChecklist';

vi.mock('./PlatformSelector', () => ({ default: () => null }));
vi.mock('./PublishButton', () => ({ default: () => null }));
vi.mock('./PublishStatusPanel', () => ({ default: () => null }));
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
  variantStatusBadge: { synced: 'synced', adapted: 'adapted' },
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
vi.mock('./publish.css', () => ({
  adaptButton: 'adaptButton',
  adaptButtonRevert: 'adaptButtonRevert',
  spinIcon: 'spinIcon',
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

function variant(overrides: Partial<PlatformVariant> = {}): PlatformVariant {
  return {
    id: 'variant-1',
    draftId: 'draft-1',
    platform: 'wechat',
    title: 'Main title',
    content: 'Main content',
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

function responseWithVariants(variants: PlatformVariant[]) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({ variants }),
  } as unknown as Response;
}

function responseWithVariant(savedVariant: PlatformVariant) {
  return {
    ok: true,
    json: vi.fn().mockResolvedValue({ variant: savedVariant }),
  } as unknown as Response;
}

function agentResponse() {
  const payload = JSON.stringify({ content: 'AI content', changeSummary: 'AI summary' });
  const stream = new globalThis.ReadableStream({
    start(controller) {
      const encoder = new globalThis.TextEncoder();
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'delta', content: payload })}\n`),
      );
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n`));
      controller.close();
    },
  });

  return { ok: true, body: stream } as unknown as Response;
}

describe('PublishChecklist AI variant collaboration', () => {
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

  it('confirms before replacing a variant after a real AI save succeeds', async () => {
    const savedVariant = variant({
      content: 'AI content',
      status: 'adapted',
      generatedByAgent: true,
      changeSummary: 'AI summary',
    });
    const forceReplacement = variant({ id: 'forced-variant', content: 'forced content' });
    const fetchMock = vi.fn((url: string, init?: { method?: string }) => {
      if (url === '/api/drafts/draft-1/variants' && !init?.method) {
        return Promise.resolve(responseWithVariants([variant()]));
      }
      if (url === '/api/agent/adapt') return Promise.resolve(agentResponse());
      if (url === '/api/platform-variants/variant-1' && init?.method === 'PATCH') {
        return Promise.resolve(responseWithVariant(savedVariant));
      }
      if (url === '/api/drafts/draft-1/variants' && init?.method === 'POST') {
        return Promise.resolve(responseWithVariants([forceReplacement]));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', confirmMock);

    render(<PublishChecklist agentEnabled />);
    await screen.findByDisplayValue('Main content');
    fireEvent.click(screen.getByRole('button', { name: 'AI 适配' }));
    await screen.findByRole('button', { name: '回退' });

    fireEvent.click(screen.getByRole('button', { name: '同步' }));

    expect(confirmMock).toHaveBeenCalledWith(
      '重新生成会覆盖这个渠道版本的人工或 AI 修改，是否继续？',
    );
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) => url === '/api/drafts/draft-1/variants' && init?.method === 'POST',
      ),
    ).toHaveLength(0);
  });

  it('blocks forced replacement while the real AI save is pending', async () => {
    const pendingSave = deferred<Response>();
    const forceReplacement = variant({ id: 'forced-variant', content: 'forced content' });
    const fetchMock = vi.fn((url: string, init?: { method?: string }) => {
      if (url === '/api/drafts/draft-1/variants' && !init?.method) {
        return Promise.resolve(responseWithVariants([variant()]));
      }
      if (url === '/api/agent/adapt') return Promise.resolve(agentResponse());
      if (url === '/api/platform-variants/variant-1' && init?.method === 'PATCH') {
        return pendingSave.promise;
      }
      if (url === '/api/drafts/draft-1/variants' && init?.method === 'POST') {
        return Promise.resolve(responseWithVariants([forceReplacement]));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist agentEnabled />);
    await screen.findByDisplayValue('Main content');
    fireEvent.click(screen.getByRole('button', { name: 'AI 适配' }));
    await waitFor(() =>
      expect(
        fetchMock.mock.calls.some(
          ([url, init]) => url === '/api/platform-variants/variant-1' && init?.method === 'PATCH',
        ),
      ).toBe(true),
    );

    const syncButton = screen.getByRole('button', { name: '同步' });
    expect(syncButton.hasAttribute('disabled')).toBe(true);
    fireEvent.click(syncButton);
    expect(
      fetchMock.mock.calls.filter(
        ([url, init]) => url === '/api/drafts/draft-1/variants' && init?.method === 'POST',
      ),
    ).toHaveLength(0);

    pendingSave.resolve(
      responseWithVariant(
        variant({ content: 'AI content', status: 'adapted', generatedByAgent: true }),
      ),
    );
    await screen.findByRole('button', { name: '回退' });
  });

  it('does not show AI adaptation when the final PATCH fails', async () => {
    const pendingSave = deferred<Response>();
    const fetchMock = vi.fn((url: string, init?: { method?: string }) => {
      if (url === '/api/drafts/draft-1/variants' && !init?.method) {
        return Promise.resolve(responseWithVariants([variant()]));
      }
      if (url === '/api/agent/adapt') return Promise.resolve(agentResponse());
      if (url === '/api/platform-variants/variant-1' && init?.method === 'PATCH') {
        return pendingSave.promise;
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<PublishChecklist agentEnabled />);
    await screen.findByDisplayValue('Main content');
    fireEvent.click(screen.getByRole('button', { name: 'AI 适配' }));
    await screen.findByRole('button', { name: '适配中…' });

    pendingSave.resolve({ ok: false } as Response);
    await screen.findByRole('button', { name: 'AI 适配' });

    expect(screen.queryByRole('button', { name: '回退' })).toBeNull();
    expect(usePublishStore.getState().platformDrafts.wechat.aiAdapted).not.toBe(true);
  });

  it('uses the final PATCH variant as the authoritative result on creation', async () => {
    const createdVariant = variant({ id: 'created-variant' });
    const savedVariant = variant({
      id: 'created-variant',
      content: 'AI content',
      status: 'adapted',
      generatedByAgent: true,
      changeSummary: 'AI summary',
    });
    const fetchMock = vi.fn((url: string, init?: { method?: string; body?: string }) => {
      if (url === '/api/drafts/draft-1/variants' && !init?.method) {
        return Promise.resolve(responseWithVariants([]));
      }
      if (url === '/api/agent/adapt') return Promise.resolve(agentResponse());
      if (url === '/api/drafts/draft-1/variants' && init?.method === 'POST') {
        return Promise.resolve(responseWithVariants([createdVariant]));
      }
      if (url === '/api/platform-variants/created-variant' && init?.method === 'PATCH') {
        return Promise.resolve(responseWithVariant(savedVariant));
      }
      throw new Error(`Unexpected request: ${url}`);
    });
    const confirmMock = vi.fn().mockReturnValue(false);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', confirmMock);

    render(<PublishChecklist agentEnabled />);
    const adaptButton = await screen.findByRole('button', { name: 'AI 适配' });
    fireEvent.click(adaptButton);
    await screen.findByRole('button', { name: '回退' });

    expect(usePublishStore.getState().variantIds.wechat).toBe('created-variant');
    expect(screen.getByDisplayValue('AI content')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '同步' }));
    expect(confirmMock).toHaveBeenCalledWith(
      '重新生成会覆盖这个渠道版本的人工或 AI 修改，是否继续？',
    );

    const creationCall = fetchMock.mock.calls.find(
      ([url, init]) => url === '/api/drafts/draft-1/variants' && init?.method === 'POST',
    );
    expect(creationCall?.[1]?.body).toBe(JSON.stringify({ platforms: ['wechat'] }));
  });
});
