import { useRef, useState, type ChangeEvent } from 'react';
import { Upload } from 'lucide-react';
import { createDraft } from '@/lib/drafts/client';
import { parseMarkdownImport } from '@/lib/drafts/importExport';
import type { ContentDraft } from '@/lib/drafts/types';
import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { useToastStore } from '@/stores/toastStore';

interface MarkdownImportButtonProps {
  className?: string;
  onImported: (draft: ContentDraft) => void;
}

export default function MarkdownImportButton({ className, onImported }: MarkdownImportButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const isDirty = useSaveStatusStore((state) => state.isDirty);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (isDirty && !window.confirm('当前稿件尚未保存。导入后将切换到新稿件，是否继续？')) {
      input.value = '';
      return;
    }

    setImporting(true);
    try {
      const parsed = parseMarkdownImport(file.name, await file.text());
      const draft = await createDraft({ ...parsed, source: 'import' });
      onImported(draft);
      useToastStore.getState().addToast('success', 'Markdown 已导入并保存');
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Markdown 导入失败';
      useToastStore.getState().addToast('error', message);
    } finally {
      input.value = '';
      setImporting(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".md,text/markdown"
        hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        className={className}
        disabled={importing}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} />
        {importing ? '导入中…' : '导入 Markdown'}
      </button>
    </>
  );
}
