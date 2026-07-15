import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureDraft, updateDraft } from '@/lib/drafts/client';
import type { ContentDraft } from '@/lib/drafts/types';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { useToastStore } from '@/stores/toastStore';
import { useManualSave } from './useManualSave';

vi.mock('@/lib/drafts/client', () => ({
  ensureDraft: vi.fn(),
  updateDraft: vi.fn(),
}));

const savedDraft: ContentDraft = {
  id: 'draft-a',
  title: 'Draft A',
  content: 'Original content',
  status: 'draft',
  source: 'manual',
  revision: 1,
  createdAt: '2026-07-16T00:00:00.000Z',
  updatedAt: '2026-07-16T00:00:00.000Z',
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

describe('useManualSave', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveStatusStore.setState({ isDirty: false, isSaving: false, saveStatus: 'idle' });
    useToastStore.setState({ toasts: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('keeps edits made during a pending save dirty after the request succeeds', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    const onDraftCreated = vi.fn();
    const { result, rerender } = renderHook(
      ({ content }) =>
        useManualSave({
          title: 'Draft A',
          content,
          draftId: null,
          onDraftCreated,
        }),
      { initialProps: { content: 'Original content' } },
    );

    let savePromise!: Promise<void>;
    act(() => {
      savePromise = result.current.save();
    });
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    expect(useSaveStatusStore.getState().isSaving).toBe(true);

    rerender({ content: 'Edited while saving' });
    await waitFor(() => expect(useSaveStatusStore.getState().saveStatus).toBe('idle'));

    await act(async () => {
      pendingSave.resolve(savedDraft);
      await savePromise;
    });

    expect(onDraftCreated).toHaveBeenCalledWith('draft-a');
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: true,
      saveStatus: 'idle',
    });
    expect(useToastStore.getState().toasts).not.toContainEqual(
      expect.objectContaining({ message: '草稿已保存' }),
    );
  });

  it('flushes the latest edits when the page hides during a pending manual save', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    const keepaliveFetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', keepaliveFetch);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { result, rerender } = renderHook(
      ({ content }) =>
        useManualSave({
          title: 'Draft A',
          content,
          draftId: null,
          onDraftCreated: vi.fn(),
        }),
      { initialProps: { content: 'Original content' } },
    );

    const savePromise = result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    expect(ensureDraft).toHaveBeenCalledWith({
      title: 'Draft A',
      content: 'Original content',
      source: 'manual',
    });

    rerender({ content: 'Latest content' });
    await waitFor(() => expect(useSaveStatusStore.getState().isDirty).toBe(true));
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(keepaliveFetch).toHaveBeenCalledWith('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Draft A', content: 'Latest content' }),
      keepalive: true,
    });
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: true,
      isDirty: true,
      saveStatus: 'idle',
    });

    await act(async () => {
      pendingSave.resolve(savedDraft);
      await savePromise;
    });
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: true,
      saveStatus: 'idle',
    });
  });

  it('marks an unchanged successful save as saved and clean', async () => {
    vi.mocked(updateDraft).mockResolvedValue(savedDraft);
    const { result } = renderHook(() =>
      useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId: 'draft-a',
        onDraftCreated: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: false,
      saveStatus: 'saved',
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({ type: 'success', message: '草稿已保存' }),
    );
  });

  it('runs only one save operation at a time', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    const { result } = renderHook(() =>
      useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId: null,
        onDraftCreated: vi.fn(),
      }),
    );

    const first = result.current.save();
    const second = result.current.save();

    expect(second).toBe(first);
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    expect(useSaveStatusStore.getState().isSaving).toBe(true);

    await act(async () => {
      pendingSave.resolve(savedDraft);
      await first;
    });
    expect(useSaveStatusStore.getState().isSaving).toBe(false);
  });

  it('resets the durable saving signal after failure', async () => {
    vi.mocked(updateDraft).mockRejectedValue(new Error('save failed'));
    const { result } = renderHook(() =>
      useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId: 'draft-a',
        onDraftCreated: vi.fn(),
      }),
    );

    await act(async () => {
      await result.current.save();
    });

    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      saveStatus: 'error',
    });
  });

  it('resets the durable saving signal when the hook unmounts', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    const onDraftCreated = vi.fn();
    const { result, unmount } = renderHook(() =>
      useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId: null,
        onDraftCreated,
      }),
    );

    const savePromise = result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    unmount();

    expect(useSaveStatusStore.getState().isSaving).toBe(false);
    await act(async () => {
      pendingSave.resolve(savedDraft);
      await savePromise;
    });
    expect(onDraftCreated).not.toHaveBeenCalled();
    expect(useSaveStatusStore.getState().isSaving).toBe(false);
  });

  it('does not let an unmounted old operation clear a newer save signal', async () => {
    const oldSave = deferred<ContentDraft>();
    const newSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft)
      .mockReturnValueOnce(oldSave.promise)
      .mockReturnValueOnce(newSave.promise);
    const oldHook = renderHook(() =>
      useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId: null,
        onDraftCreated: vi.fn(),
      }),
    );

    const oldPromise = oldHook.result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    oldHook.unmount();

    const newHook = renderHook(() =>
      useManualSave({
        title: 'Draft B',
        content: 'New content',
        draftId: null,
        onDraftCreated: vi.fn(),
      }),
    );
    const newPromise = newHook.result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(2));
    expect(useSaveStatusStore.getState().isSaving).toBe(true);

    await act(async () => {
      oldSave.resolve(savedDraft);
      await oldPromise;
    });
    expect(useSaveStatusStore.getState().isSaving).toBe(true);

    await act(async () => {
      newSave.resolve({ ...savedDraft, id: 'draft-b', title: 'Draft B', content: 'New content' });
      await newPromise;
    });
    expect(useSaveStatusStore.getState().isSaving).toBe(false);
  });
});
