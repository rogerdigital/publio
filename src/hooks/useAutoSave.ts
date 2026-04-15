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
}: UseAutoSaveOptions): { saveStatus: SaveStatus } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 使用 ref 追踪最新值，避免 stale closure
  const draftIdRef = useRef(draftId);
  const onDraftCreatedRef = useRef(onDraftCreated);

  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);

  useEffect(() => {
    onDraftCreatedRef.current = onDraftCreated;
  }, [onDraftCreated]);

  useEffect(() => {
    // 标题和内容都为空时不触发
    if (!title.trim() && !content.trim()) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      // 标题为空时不创建新草稿，但若已有草稿则更新内容
      if (!title.trim() && !draftIdRef.current) return;

      setSaveStatus('saving');
      try {
        if (draftIdRef.current) {
          await updateDraft(draftIdRef.current, { title, content });
        } else {
          const draft = await ensureDraft({ title, content, source: 'manual' });
          onDraftCreatedRef.current(draft.id);
        }
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [title, content, debounceMs]);

  return { saveStatus };
}
