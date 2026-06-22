import { create } from 'zustand';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusState {
  saveStatus: SaveStatus;
  isDirty: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setIsDirty: (dirty: boolean) => void;
}

/**
 * 保存状态独立 store：保存按钮组件自行订阅，避免保存时整棵编辑器
 * （含 MDEditor）跟着重渲染导致正文瞬间空白。
 */
export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  saveStatus: 'idle',
  isDirty: false,
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setIsDirty: (isDirty) => set({ isDirty }),
}));
