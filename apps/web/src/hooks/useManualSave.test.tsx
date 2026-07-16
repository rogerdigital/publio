import { act, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
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

  it('discards a pending first save after switching to another draft session', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    const onDraftCreated = vi.fn();
    const { result, rerender } = renderHook(
      ({ title, content, draftId }) => useManualSave({ title, content, draftId, onDraftCreated }),
      {
        initialProps: {
          title: 'Draft A',
          content: 'Content A',
          draftId: null as string | null,
        },
      },
    );

    const oldSavePromise = result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));

    act(() => result.current.invalidateSession());
    rerender({ title: 'Draft B', content: 'Content B', draftId: 'draft-b' });
    act(() => result.current.syncSnapshot({ title: 'Draft B', content: 'Content B' }));

    await act(async () => {
      pendingSave.resolve(savedDraft);
      await oldSavePromise;
    });

    expect(onDraftCreated).not.toHaveBeenCalled();
    expect(useToastStore.getState().toasts).toEqual([]);
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: false,
      saveStatus: 'idle',
    });
  });

  it('does not let a pending patch overwrite the loaded draft snapshot', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(updateDraft).mockReturnValue(pendingSave.promise);
    const { result, rerender } = renderHook(
      ({ title, content, draftId }) =>
        useManualSave({ title, content, draftId, onDraftCreated: vi.fn() }),
      {
        initialProps: {
          title: 'Draft A',
          content: 'Content A',
          draftId: 'draft-a' as string | null,
        },
      },
    );

    const oldSavePromise = result.current.save();
    await waitFor(() =>
      expect(updateDraft).toHaveBeenCalledWith('draft-a', {
        title: 'Draft A',
        content: 'Content A',
      }),
    );

    act(() => result.current.invalidateSession());
    rerender({ title: 'Draft B', content: 'Content B', draftId: 'draft-b' });
    act(() => result.current.syncSnapshot({ title: 'Draft B', content: 'Content B' }));

    await act(async () => {
      pendingSave.resolve(savedDraft);
      await oldSavePromise;
    });

    expect(useToastStore.getState().toasts).toEqual([]);
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: false,
      saveStatus: 'idle',
    });
  });

  it('discards an error from an invalidated draft session', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(updateDraft).mockReturnValue(pendingSave.promise);
    const { result, rerender } = renderHook(
      ({ title, content, draftId }) =>
        useManualSave({ title, content, draftId, onDraftCreated: vi.fn() }),
      {
        initialProps: {
          title: 'Draft A',
          content: 'Content A',
          draftId: 'draft-a' as string | null,
        },
      },
    );

    const oldSavePromise = result.current.save();
    await waitFor(() => expect(updateDraft).toHaveBeenCalledTimes(1));
    act(() => result.current.invalidateSession());
    rerender({ title: 'Draft B', content: 'Content B', draftId: 'draft-b' });
    act(() => result.current.syncSnapshot({ title: 'Draft B', content: 'Content B' }));

    await act(async () => {
      pendingSave.reject(new Error('Draft A failed'));
      await oldSavePromise;
    });

    expect(useToastStore.getState().toasts).toEqual([]);
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: false,
      saveStatus: 'idle',
    });
  });

  it('allows a new session save while the invalidated operation is still pending', async () => {
    const oldSave = deferred<ContentDraft>();
    const newSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(oldSave.promise);
    vi.mocked(updateDraft).mockReturnValue(newSave.promise);
    const onDraftCreated = vi.fn();
    const { result, rerender } = renderHook(
      ({ title, content, draftId }) => useManualSave({ title, content, draftId, onDraftCreated }),
      {
        initialProps: {
          title: 'Draft A',
          content: 'Content A',
          draftId: null as string | null,
        },
      },
    );

    const oldSavePromise = result.current.save();
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));
    act(() => result.current.invalidateSession());
    rerender({ title: 'Draft B', content: 'Content B', draftId: 'draft-b' });
    act(() => result.current.syncSnapshot({ title: 'Draft B', content: 'Content B' }));

    const newSavePromise = result.current.save();
    expect(newSavePromise).not.toBe(oldSavePromise);
    await waitFor(() =>
      expect(updateDraft).toHaveBeenCalledWith('draft-b', {
        title: 'Draft B',
        content: 'Content B',
      }),
    );

    await act(async () => {
      oldSave.resolve(savedDraft);
      await oldSavePromise;
    });
    expect(onDraftCreated).not.toHaveBeenCalled();
    expect(useSaveStatusStore.getState().isSaving).toBe(true);
    expect(result.current.save()).toBe(newSavePromise);

    await act(async () => {
      newSave.resolve({ ...savedDraft, id: 'draft-b', title: 'Draft B', content: 'Content B' });
      await newSavePromise;
    });
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: false,
      saveStatus: 'saved',
    });
    expect(useToastStore.getState().toasts).toHaveLength(1);
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

  it('flushes newer edits after an older keepalive response completes', async () => {
    const firstFlush = deferred<Response>();
    const secondFlush = deferred<Response>();
    const keepaliveFetch = vi
      .fn()
      .mockReturnValueOnce(firstFlush.promise)
      .mockReturnValueOnce(secondFlush.promise)
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', keepaliveFetch);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { rerender } = renderHook(
      ({ content }) =>
        useManualSave({
          title: 'Draft A',
          content,
          draftId: 'draft-a',
          onDraftCreated: vi.fn(),
        }),
      { initialProps: { content: 'Original content' } },
    );

    rerender({ content: 'Edit A1' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(keepaliveFetch).toHaveBeenNthCalledWith(1, '/api/drafts/draft-a', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Draft A', content: 'Edit A1' }),
      keepalive: true,
    });

    rerender({ content: 'Edit A2' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(keepaliveFetch).toHaveBeenNthCalledWith(2, '/api/drafts/draft-a', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Draft A', content: 'Edit A2' }),
      keepalive: true,
    });

    await act(async () => {
      firstFlush.resolve(new Response(null, { status: 204 }));
      await firstFlush.promise;
      await Promise.resolve();
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(keepaliveFetch).toHaveBeenNthCalledWith(3, '/api/drafts/draft-a', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Draft A', content: 'Edit A2' }),
      keepalive: true,
    });
  });

  it('does not let an old session keepalive response suppress the new session flush', async () => {
    const oldFlush = deferred<Response>();
    const keepaliveFetch = vi
      .fn()
      .mockReturnValueOnce(oldFlush.promise)
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', keepaliveFetch);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { result, rerender } = renderHook(
      ({ title, content, draftId }) =>
        useManualSave({ title, content, draftId, onDraftCreated: vi.fn() }),
      {
        initialProps: {
          title: 'Draft A',
          content: 'Original A',
          draftId: 'draft-a' as string | null,
        },
      },
    );

    rerender({ title: 'Draft A', content: 'Edit A1', draftId: 'draft-a' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    expect(keepaliveFetch).toHaveBeenCalledTimes(1);

    act(() => result.current.invalidateSession());
    rerender({ title: 'Draft B', content: 'Original B', draftId: 'draft-b' });
    act(() => result.current.syncSnapshot({ title: 'Draft B', content: 'Original B' }));
    rerender({ title: 'Draft B', content: 'Edit B1', draftId: 'draft-b' });

    await act(async () => {
      oldFlush.resolve(new Response(null, { status: 204 }));
      await oldFlush.promise;
      await Promise.resolve();
    });
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(keepaliveFetch).toHaveBeenNthCalledWith(2, '/api/drafts/draft-b', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Draft B', content: 'Edit B1' }),
      keepalive: true,
    });
  });

  it('retries a dirty keepalive snapshot after a non-success response', async () => {
    const keepaliveFetch = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 500 }))
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', keepaliveFetch);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { rerender } = renderHook(
      ({ content }) =>
        useManualSave({
          title: 'Draft A',
          content,
          draftId: 'draft-a',
          onDraftCreated: vi.fn(),
        }),
      { initialProps: { content: 'Original content' } },
    );

    rerender({ content: 'Edit A1' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await waitFor(() => expect(keepaliveFetch).toHaveBeenCalledTimes(1));
    await act(async () => Promise.resolve());
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(keepaliveFetch).toHaveBeenCalledTimes(2);
  });

  it('retries a dirty keepalive snapshot after a network error', async () => {
    const keepaliveFetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', keepaliveFetch);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    const { rerender } = renderHook(
      ({ content }) =>
        useManualSave({
          title: 'Draft A',
          content,
          draftId: 'draft-a',
          onDraftCreated: vi.fn(),
        }),
      { initialProps: { content: 'Original content' } },
    );

    rerender({ content: 'Edit A1' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    await waitFor(() => expect(keepaliveFetch).toHaveBeenCalledTimes(1));
    await act(async () => Promise.resolve());
    act(() => document.dispatchEvent(new Event('visibilitychange')));

    expect(keepaliveFetch).toHaveBeenCalledTimes(2);
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

  it('keeps a successful first save active when its created id updates the hook props', async () => {
    vi.mocked(ensureDraft).mockResolvedValue(savedDraft);
    const onDraftCreated = vi.fn();
    const { result } = renderHook(() => {
      const [draftId, setDraftId] = useState<string | null>(null);
      const manualSave = useManualSave({
        title: 'Draft A',
        content: 'Original content',
        draftId,
        onDraftCreated: (id) => {
          onDraftCreated(id);
          setDraftId(id);
        },
      });
      return { ...manualSave, draftId };
    });

    await act(async () => {
      await result.current.save();
    });

    expect(result.current.draftId).toBe('draft-a');
    expect(onDraftCreated).toHaveBeenCalledWith('draft-a');
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
