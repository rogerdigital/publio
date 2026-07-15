import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContentDraft } from '@/lib/drafts/types';
import { createDraft } from '@/lib/drafts/client';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { useToastStore } from '@/stores/toastStore';
import MarkdownImportButton from './MarkdownImportButton';

vi.mock('@/lib/drafts/client', () => ({
  createDraft: vi.fn(),
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

describe('MarkdownImportButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSaveStatusStore.setState({ isDirty: false, saveStatus: 'idle' });
    useToastStore.setState({ toasts: [] });
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
});
