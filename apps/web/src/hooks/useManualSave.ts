import { useCallback, useEffect, useRef } from 'react';
import { updateDraft, ensureDraft } from '@/lib/drafts/client';
import { useToastStore } from '@/stores/toastStore';
import { useSaveStatusStore } from '@/stores/saveStatusStore';

interface UseManualSaveOptions {
  title: string;
  content: string;
  draftId: string | null;
  onDraftCreated: (id: string) => void;
}

interface UseManualSaveResult {
  save: () => Promise<void>;
  /** 载入草稿后调用，把快照同步为载入值，避免载入即误判 dirty。 */
  syncSnapshot: (snapshot: { title: string; content: string }) => void;
}

/**
 * 写作台手动保存 + 兜底保存。保存状态（saveStatus/isDirty）写入独立的
 * useSaveStatusStore，由保存按钮组件自行订阅，避免保存时整棵编辑器重渲染。
 *
 * - 手动保存：`save()` 走正常 fetch（有 draftId → PATCH；无 → POST 创建）。
 * - 兜底保存：页面 beforeunload / 切到后台（visibilitychange）时，若 dirty
 *   则用 `fetch(url, { keepalive: true })` 发送，保证卸载后请求仍能到达。
 * - dirty 判断：title/content 与 lastSaved 快照对比，不同即 dirty；
 *   成功保存后更新快照。载入草稿后须调用 syncSnapshot 避免误判。
 */
export function useManualSave({
  title,
  content,
  draftId,
  onDraftCreated,
}: UseManualSaveOptions): UseManualSaveResult {
  // 最新值与快照都放 ref，事件监听器读最新值，无需重建监听器。
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const draftIdRef = useRef(draftId);
  const onDraftCreatedRef = useRef(onDraftCreated);
  const lastSavedRef = useRef<{ title: string; content: string }>({
    title,
    content,
  });
  // dirty 用 ref 存，避免事件回调闭包陈旧；UI 侧通过 store 订阅。
  const dirtyRef = useRef(false);

  useEffect(() => {
    titleRef.current = title;
  }, [title]);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    draftIdRef.current = draftId;
  }, [draftId]);
  useEffect(() => {
    onDraftCreatedRef.current = onDraftCreated;
  }, [onDraftCreated]);

  // title/content 变化 → 比对快照 → 更新 dirty（写入 store）。
  useEffect(() => {
    const changed =
      title !== lastSavedRef.current.title || content !== lastSavedRef.current.content;
    dirtyRef.current = changed;
    const { setIsDirty, setSaveStatus } = useSaveStatusStore.getState();
    setIsDirty(changed);
    // 进入编辑即清除"已保存"提示，避免误导。
    if (changed) setSaveStatus('idle');
  }, [title, content]);

  /** 载入草稿后调用，把快照同步为载入值，避免载入即误判 dirty。 */
  const syncSnapshot = useCallback((snapshot: { title: string; content: string }) => {
    lastSavedRef.current = snapshot;
    dirtyRef.current = false;
    const { setIsDirty, setSaveStatus } = useSaveStatusStore.getState();
    setIsDirty(false);
    setSaveStatus('idle');
  }, []);

  /** 标记已保存（更新快照 + 清 dirty）。 */
  const markSaved = useCallback(() => {
    lastSavedRef.current = {
      title: titleRef.current,
      content: contentRef.current,
    };
    dirtyRef.current = false;
    const { setIsDirty, setSaveStatus } = useSaveStatusStore.getState();
    setIsDirty(false);
    setSaveStatus('saved');
  }, []);

  /** 手动保存：走正常 fetch（可 await、可更新 UI 状态）。 */
  const save = useCallback(async () => {
    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;

    // 空校验：标题与内容必须都非空才保存（收紧：任一为空即跳过）。
    if (!currentTitle.trim() || !currentContent.trim()) return;

    useSaveStatusStore.getState().setSaveStatus('saving');
    try {
      if (draftIdRef.current) {
        await updateDraft(draftIdRef.current, {
          title: currentTitle,
          content: currentContent,
        });
      } else {
        const draft = await ensureDraft({
          title: currentTitle,
          content: currentContent,
          source: 'manual',
        });
        onDraftCreatedRef.current(draft.id);
      }
      markSaved();
      useToastStore.getState().addToast('success', '草稿已保存');
    } catch {
      useSaveStatusStore.getState().setSaveStatus('error');
      useToastStore.getState().addToast('error', '草稿保存失败，请检查网络后重试');
    }
  }, [markSaved]);

  /**
   * 兜底保存：unload 期间用 keepalive fetch 发出，不 await、不更新 React 状态
   * （组件即将卸载/已卸载）。成功后立即置 dirty=false 避免重复触发。
   */
  const flushSave = useCallback(() => {
    if (!dirtyRef.current) return;
    const currentTitle = titleRef.current;
    const currentContent = contentRef.current;
    // 空校验：标题与内容必须都非空。
    if (!currentTitle.trim() || !currentContent.trim()) return;

    const payload = JSON.stringify({ title: currentTitle, content: currentContent });
    const url = draftIdRef.current ? `/api/drafts/${draftIdRef.current}` : '/api/drafts';
    const method = draftIdRef.current ? 'PATCH' : 'POST';

    // keepalive 让请求在页面卸载后仍由浏览器发出。
    void fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).then(() => {
      // 标记已保存，防止 visibilitychange 与 beforeunload 重复发请求。
      dirtyRef.current = false;
    });
  }, []);

  // 兜底保存监听：beforeunload + visibilitychange。读 ref，监听器只注册一次。
  useEffect(() => {
    const handleBeforeUnload = () => flushSave();
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [flushSave]);

  return {
    save,
    syncSnapshot,
  };
}
