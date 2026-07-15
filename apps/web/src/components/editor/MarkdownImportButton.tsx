import { useEffect, useRef, useState, type ChangeEvent } from 'react';
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
  const mountedRef = useRef(true);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    const { isDirty, isSaving } = useSaveStatusStore.getState();
    if (isSaving) {
      useToastStore.getState().addToast('error', '正在保存当前稿件，请稍后再导入');
      input.value = '';
      return;
    }

    if (isDirty && !window.confirm('当前稿件尚未保存。导入后将切换到新稿件，是否继续？')) {
      input.value = '';
      return;
    }

    setImporting(true);
    try {
      const raw = await file.text();
      if (!mountedRef.current) return;
      if (useSaveStatusStore.getState().isSaving) {
        useToastStore.getState().addToast('error', '正在保存当前稿件，请稍后再导入');
        return;
      }
      const parsed = parseMarkdownImport(file.name, raw);
      const draft = await createDraft({ ...parsed, source: 'import' });
      if (!mountedRef.current) return;
      if (useSaveStatusStore.getState().isSaving) {
        useToastStore
          .getState()
          .addToast('success', 'Markdown 已导入并保存到稿件库；当前稿件保存完成后可从稿件库打开');
        return;
      }
      onImported(draft);
      if (!mountedRef.current) return;
      useToastStore.getState().addToast('success', 'Markdown 已导入并保存');
    } catch (error) {
      if (!mountedRef.current) return;
      const message = error instanceof Error && error.message ? error.message : 'Markdown 导入失败';
      useToastStore.getState().addToast('error', message);
    } finally {
      if (mountedRef.current) {
        input.value = '';
        setImporting(false);
      }
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
