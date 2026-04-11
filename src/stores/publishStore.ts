import { create } from 'zustand';
import { PlatformId, PlatformPublishResult, PublishStatus } from '@/types';
import { resolveOverallPublishStatus } from '@/lib/publishStatus';

interface PublishStore {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;

  platforms: Record<PlatformId, boolean>;
  togglePlatform: (id: PlatformId) => void;

  overallStatus: PublishStatus;
  results: PlatformPublishResult[];
  setPublishing: () => void;
  setResults: (results: PlatformPublishResult[]) => void;
  reset: () => void;
}

export const usePublishStore = create<PublishStore>((set) => ({
  title: '',
  content: '',
  setTitle: (title) => set({ title }),
  setContent: (content) => set({ content }),

  platforms: {
    wechat: true,
    xiaohongshu: true,
    zhihu: true,
    x: true,
  },
  togglePlatform: (id) =>
    set((state) => ({
      platforms: { ...state.platforms, [id]: !state.platforms[id] },
    })),

  overallStatus: 'idle',
  results: [],
  setPublishing: () => set({ overallStatus: 'publishing', results: [] }),
  setResults: (results) =>
    set({
      results,
      overallStatus: resolveOverallPublishStatus(results),
    }),
  reset: () => set({ overallStatus: 'idle', results: [] }),
}));
