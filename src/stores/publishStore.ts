import { create } from 'zustand';
import { PlatformId, PlatformPublishResult, PLATFORMS, PublishStatus } from '@/types';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import type {
  PlatformContentDraft,
  PlatformContentDrafts,
} from '@/lib/platformAdapters/types';
import { resolveOverallPublishStatus } from '@/lib/publishStatus';

interface PublishStore {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;

  platforms: Record<PlatformId, boolean>;
  togglePlatform: (id: PlatformId) => void;

  platformDrafts: PlatformContentDrafts;
  syncPlatformDrafts: () => void;
  updatePlatformDraft: (
    platform: PlatformId,
    input: Partial<Pick<PlatformContentDraft, 'title' | 'body' | 'suggestedTags' | 'threadParts'>>,
  ) => void;

  overallStatus: PublishStatus;
  results: PlatformPublishResult[];
  setPublishing: () => void;
  setResults: (results: PlatformPublishResult[]) => void;
  reset: () => void;
}

const platformIds = PLATFORMS.map((platform) => platform.id);
const emptyPlatformDrafts = adaptContentForPlatforms({
  title: '',
  content: '',
  platforms: platformIds,
});

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

  platformDrafts: emptyPlatformDrafts,
  syncPlatformDrafts: () =>
    set((state) => ({
      platformDrafts: adaptContentForPlatforms({
        title: state.title,
        content: state.content,
        platforms: platformIds,
      }),
    })),
  updatePlatformDraft: (platform, input) =>
    set((state) => ({
      platformDrafts: {
        ...state.platformDrafts,
        [platform]: {
          ...state.platformDrafts[platform],
          ...input,
        },
      },
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
