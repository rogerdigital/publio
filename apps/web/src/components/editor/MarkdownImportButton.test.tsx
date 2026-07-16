import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentDraft } from '@/lib/drafts/types';
import { createDraft, ensureDraft } from '@/lib/drafts/client';
import { useManualSave } from '@/hooks/useManualSave';
import { usePublishStore } from '@/stores/publishStore';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { useToastStore } from '@/stores/toastStore';
import MarkdownImportButton from './MarkdownImportButton';

vi.mock('@/lib/drafts/client', () => ({
  createDraft: vi.fn(),
  ensureDraft: vi.fn(),
  updateDraft: vi.fn(),
}));

const importedDraft: ContentDraft = {
  id: 'draft-imported',
  title: 'Imported title',
  content: 'Paragraph',
  status: 'draft',
  source: 'import',
  revision: 1,
  createdAt: '2026-07-16T00:00:00.000Z',
  updatedAt: '2026-07-16T00:00:00.000Z',
};

function createMarkdownFile(contents = '# Imported title\n\nParagraph') {
  const file = new File([contents], 'article.md', { type: 'text/markdown' });
  Object.defineProperty(file, 'text', {
    value: vi.fn().mockResolvedValue(contents),
  });
  return file;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
}

function SaveImportHarness() {
  const title = usePublishStore((state) => state.title);
  const content = usePublishStore((state) => state.content);
  const currentDraftId = usePublishStore((state) => state.currentDraftId);
  const setTitle = usePublishStore((state) => state.setTitle);
  const setContent = usePublishStore((state) => state.setContent);
  const setCurrentDraftId = usePublishStore((state) => state.setCurrentDraftId);
  const { save } = useManualSave({
    title,
    content,
    draftId: currentDraftId,
    onDraftCreated: setCurrentDraftId,
  });

  return (
    <>
      <button type="button" onClick={() => void save()}>
        开始保存
      </button>
      <button type="button" onClick={() => setContent('Edited while saving')}>
        继续编辑
      </button>
      <span data-testid="draft-id">{currentDraftId ?? 'none'}</span>
      <span data-testid="draft-content">{content}</span>
      <MarkdownImportButton
        onImported={(draft) => {
          setTitle(draft.title);
          setContent(draft.content);
          setCurrentDraftId(draft.id);
        }}
      />
    </>
  );
}

describe('MarkdownImportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveStatusStore.setState({ isDirty: false, isSaving: false, saveStatus: 'idle' });
    useToastStore.setState({ toasts: [] });
    usePublishStore.setState({
      title: 'Draft A',
      content: 'Original A',
      currentDraftId: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates the parsed draft before handing the saved revision to Home', async () => {
    vi.mocked(createDraft).mockResolvedValue(importedDraft);
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(input.hidden).toBe(true);
    expect(input.accept).toBe('.md,text/markdown');
    expect(screen.getByRole('button', { name: '导入 Markdown' }).className).toBe('more-menu-item');

    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });

    await waitFor(() => {
      expect(createDraft).toHaveBeenCalledWith({
        title: 'Imported title',
        content: 'Paragraph',
        source: 'import',
      });
      expect(onImported).toHaveBeenCalledWith(importedDraft);
    });
    expect(vi.mocked(createDraft).mock.invocationCallOrder[0]).toBeLessThan(
      onImported.mock.invocationCallOrder[0],
    );
    expect(useToastStore.getState().toasts.at(-1)).toMatchObject({
      type: 'success',
      message: 'Markdown 已导入并保存',
    });
  });

  it('does not read or create a draft when a dirty-editor import is cancelled', () => {
    useSaveStatusStore.setState({ isDirty: true });
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const file = createMarkdownFile();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={vi.fn()} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    expect(confirm).toHaveBeenCalledWith('当前稿件尚未保存。导入后将切换到新稿件，是否继续？');
    expect(file.text).not.toHaveBeenCalled();
    expect(createDraft).not.toHaveBeenCalled();
  });

  it('keeps the current draft untouched and preserves the API error message', async () => {
    vi.mocked(createDraft).mockRejectedValue(new Error('稿件创建冲突'));
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });

    await waitFor(() => {
      expect(useToastStore.getState().toasts.at(-1)).toMatchObject({
        type: 'error',
        message: '稿件创建冲突',
      });
    });
    expect(onImported).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '导入 Markdown' }).hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('uses the exact fallback for non-Error failures and remains reusable', async () => {
    vi.mocked(createDraft).mockRejectedValueOnce('request failed');
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith('error', 'Markdown 导入失败');
    });
    expect(onImported).not.toHaveBeenCalled();
    expect(input.value).toBe('');
    expect(screen.getByRole('button', { name: '导入 Markdown' }).hasAttribute('disabled')).toBe(
      false,
    );

    vi.mocked(createDraft).mockResolvedValueOnce(importedDraft);
    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });

    await waitFor(() => {
      expect(onImported).toHaveBeenCalledWith(importedDraft);
    });
  });

  it('blocks import when saving starts after the file dialog opens', () => {
    const pendingText = vi.fn(() => new Promise<string>(() => {}));
    const file = new File(['# Imported title\n\nParagraph'], 'article.md', {
      type: 'text/markdown',
    });
    Object.defineProperty(file, 'text', { value: pendingText });
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    act(() => useSaveStatusStore.setState({ isSaving: true, saveStatus: 'idle' }));
    fireEvent.change(input, { target: { files: [file] } });

    expect(pendingText).not.toHaveBeenCalled();
    expect(createDraft).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith('error', '正在保存当前稿件，请稍后再导入');
    expect(input.value).toBe('');
  });

  it('ignores a completed import after the component unmounts', async () => {
    const pendingDraft = deferred<ContentDraft>();
    vi.mocked(createDraft).mockReturnValue(pendingDraft.promise);
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    const onImported = vi.fn();
    const { container, unmount } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });
    await waitFor(() => expect(createDraft).toHaveBeenCalledTimes(1));
    unmount();

    await act(async () => {
      pendingDraft.resolve(importedDraft);
      await pendingDraft.promise;
      await Promise.resolve();
    });

    expect(onImported).not.toHaveBeenCalled();
    expect(addToast).not.toHaveBeenCalledWith('success', 'Markdown 已导入并保存');
  });

  it('keeps a created import in the library when saving starts before creation completes', async () => {
    const pendingDraft = deferred<ContentDraft>();
    vi.mocked(createDraft).mockReturnValue(pendingDraft.promise);
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });
    await waitFor(() => expect(createDraft).toHaveBeenCalledTimes(1));
    act(() => useSaveStatusStore.setState({ isSaving: true, saveStatus: 'idle' }));

    await act(async () => {
      pendingDraft.resolve(importedDraft);
      await pendingDraft.promise;
      await Promise.resolve();
    });

    expect(onImported).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith(
      'success',
      'Markdown 已导入并保存到稿件库；当前稿件保存完成后可从稿件库打开',
    );
    expect(addToast).not.toHaveBeenCalledWith('success', 'Markdown 已导入并保存');
  });

  it('does not create a draft when saving starts during file reading', async () => {
    const pendingText = deferred<string>();
    const file = new File(['# Imported title\n\nParagraph'], 'article.md', {
      type: 'text/markdown',
    });
    Object.defineProperty(file, 'text', {
      value: vi.fn().mockReturnValue(pendingText.promise),
    });
    vi.mocked(createDraft).mockResolvedValue(importedDraft);
    const addToast = vi.spyOn(useToastStore.getState(), 'addToast');
    const onImported = vi.fn();
    const { container } = render(
      <MarkdownImportButton className="more-menu-item" onImported={onImported} />,
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });
    act(() => useSaveStatusStore.setState({ isSaving: true, saveStatus: 'idle' }));

    await act(async () => {
      pendingText.resolve('# Imported title\n\nParagraph');
      await pendingText.promise;
      await Promise.resolve();
    });

    expect(createDraft).not.toHaveBeenCalled();
    expect(onImported).not.toHaveBeenCalled();
    expect(addToast).toHaveBeenCalledWith('error', '正在保存当前稿件，请稍后再导入');
  });

  it('keeps a pending first save isolated from editing and import', async () => {
    const pendingSave = deferred<ContentDraft>();
    vi.mocked(ensureDraft).mockReturnValue(pendingSave.promise);
    vi.mocked(createDraft).mockResolvedValue(importedDraft);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { container } = render(<SaveImportHarness />);

    fireEvent.click(screen.getByRole('button', { name: '开始保存' }));
    await waitFor(() => expect(ensureDraft).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole('button', { name: '继续编辑' }));
    await waitFor(() => expect(useSaveStatusStore.getState().saveStatus).toBe('idle'));
    expect(useSaveStatusStore.getState().isSaving).toBe(true);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [createMarkdownFile()] } });
    await waitFor(() => expect(useToastStore.getState().toasts.length).toBeGreaterThan(0));

    await act(async () => {
      pendingSave.resolve({
        ...importedDraft,
        id: 'saved-draft-a',
        title: 'Draft A',
        content: 'Original A',
        source: 'manual',
      });
      await pendingSave.promise;
      await Promise.resolve();
    });

    expect(createDraft).not.toHaveBeenCalled();
    expect(screen.getByTestId('draft-id').textContent).toBe('saved-draft-a');
    expect(screen.getByTestId('draft-content').textContent).toBe('Edited while saving');
    expect(useSaveStatusStore.getState()).toMatchObject({
      isSaving: false,
      isDirty: true,
      saveStatus: 'idle',
    });
    expect(useToastStore.getState().toasts).toContainEqual(
      expect.objectContaining({
        type: 'error',
        message: '正在保存当前稿件，请稍后再导入',
      }),
    );
  });
});
