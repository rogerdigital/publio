'use client';

import { useEffect, useRef, useState } from 'react';
import { updateDraft, ensureDraft } from '@/lib/drafts/client';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutoSaveOptions {
  title: string;
  content: string;
  draftId: string | null;
  onDraftCreated: (id: string) => void;
  debounceMs?: number;
}

export function useAutoSave({
  title,
  content,
  draftId,
  onDraftCreated,
  debounceMs = 1000,
}: UseAutoSaveOptions): { saveStatus: SaveStatus; triggerSave: () => Promise<void> } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftIdRef = useRef(draftId);
  const onDraftCreatedRef = useRef(onDraftCreated);
  const titleRef = useRef(title);
  const contentRef = useRef(content);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  useEffect(() => {
    onDraftCreatedRef.current = onDraftCreated;
  }, [onDraftCreated]);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  async function performSave() {
    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;

    if (!currentTitle.trim() && !currentContent.trim()) return;
    if (!currentTitle.trim() && !draftIdRef.current) return;

    setSaveStatus('saving');
    try {
      if (draftIdRef.current) {
        await updateDraft(draftIdRef.current, { title: currentTitle, content: currentContent });
      } else {
        const draft = await ensureDraft({ title: currentTitle, content: currentContent, source: 'manual' });
        onDraftCreatedRef.current(draft.id);
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
    }
  }

  useEffect(() => {
    if (!title.trim() && !content.trim()) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      void performSave();
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content, debounceMs]);

  return { saveStatus, triggerSave: performSave };
}
