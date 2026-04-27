import { create } from 'zustand';
import { PlatformId, PlatformPublishResult, PLATFORMS, PublishStatus } from '@/types';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import type {
  PlatformContentDrafts,
} from '@/lib/platformAdapters/types';
import { resolveOverallPublishStatus } from '@/lib/publishStatus';

interface PublishStore {
  title: string;
  content: string;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;

  currentDraftId: string | null;
  setCurrentDraftId: (id: string | null) => void;

  activeTab: 'edit' | 'preview';
  setActiveTab: (tab: 'edit' | 'preview') => void;

  platforms: Record<PlatformId, boolean>;
  togglePlatform: (id: PlatformId) => void;
  setAllPlatforms: (checked: boolean) => void;

  platformDrafts: PlatformContentDrafts;
  syncPlatformDrafts: () => void;

  overallStatus: PublishStatus;
  results: PlatformPublishResult[];
  setPublishing: () => void;
  setResults: (results: PlatformPublishResult[]) => void;
  reset: () => void;

  lastSyncTaskId: string | null;
  isProgressOverlayOpen: boolean;
  setLastSyncTaskId: (id: string | null) => void;
  openProgressOverlay: () => void;
  closeProgressOverlay: () => void;

  scheduledAt: string | null;
  setScheduledAt: (value: string | null) => void;
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

  currentDraftId: null,
  setCurrentDraftId: (id) => set({ currentDraftId: id }),

  activeTab: 'edit',
  setActiveTab: (tab) => set({ activeTab: tab }),

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
  setAllPlatforms: (checked) =>
    set(() => ({
      platforms: Object.fromEntries(platformIds.map((id) => [id, checked])) as Record<PlatformId, boolean>,
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

  overallStatus: 'idle',
  results: [],
  setPublishing: () => set({ overallStatus: 'publishing', results: [] }),
  setResults: (results) =>
    set({
      results,
      overallStatus: resolveOverallPublishStatus(results),
    }),
  reset: () => set({ overallStatus: 'idle', results: [], lastSyncTaskId: null, isProgressOverlayOpen: false }),

  lastSyncTaskId: null,
  isProgressOverlayOpen: false,
  setLastSyncTaskId: (id) => set({ lastSyncTaskId: id }),
  openProgressOverlay: () => set({ isProgressOverlayOpen: true }),
  closeProgressOverlay: () => set({ isProgressOverlayOpen: false }),

  scheduledAt: null,
  setScheduledAt: (value) => set({ scheduledAt: value }),
}));
