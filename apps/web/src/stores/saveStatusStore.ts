import { create } from 'zustand';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveStatusState {
  saveStatus: SaveStatus;
  isDirty: boolean;
  isSaving: boolean;
  setSaveStatus: (status: SaveStatus) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsSaving: (saving: boolean) => void;
}

/**
 * 保存状态独立 store：saveStatus/isDirty 服务 UI，isSaving 则跨编辑状态变化
 * 持续标记真实保存请求。保存按钮组件自行订阅，避免保存时整棵编辑器
 * （含 MDEditor）跟着重渲染导致正文瞬间空白。
 */
export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  saveStatus: 'idle',
  isDirty: false,
  isSaving: false,
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setIsDirty: (isDirty) => set({ isDirty }),
  setIsSaving: (isSaving) => set({ isSaving }),
}));
