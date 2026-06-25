import type { ContentDraft } from '@/lib/drafts/types';
import type { SyncTask } from '@/lib/sync/types';
import type { PlatformConnectionRecord } from '@/lib/platformConnections/types';
import type { PlatformId } from '@/types';

interface DraftsResponse {
  drafts?: ContentDraft[];
  error?: string;
}

interface SyncTasksResponse {
  syncTasks?: SyncTask[];
  error?: string;
}

export interface DraftLibraryData {
  drafts: ContentDraft[];
  syncTasks: SyncTask[];
}

export interface SettingsPageData {
  values: Record<string, string>;
  connectionRecords: Record<PlatformId, PlatformConnectionRecord>;
}

export interface HomePageChromeData {
  agentEnabled: boolean;
}

let draftLibraryData: DraftLibraryData | null = null;
let draftLibraryPromise: Promise<DraftLibraryData> | null = null;
let settingsPageData: SettingsPageData | null = null;
let settingsPagePromise: Promise<SettingsPageData> | null = null;
let homePageChromeData: HomePageChromeData | null = null;
let homePageChromePromise: Promise<HomePageChromeData> | null = null;

export function getCachedDraftLibraryData() {
  return draftLibraryData;
}

export function setCachedDraftLibraryData(data: DraftLibraryData) {
  draftLibraryData = data;
}

export async function loadDraftLibraryData() {
  if (draftLibraryPromise) return draftLibraryPromise;

  draftLibraryPromise = Promise.all([
    fetch('/api/drafts', { cache: 'no-store' }),
    fetch('/api/sync-tasks', { cache: 'no-store' }),
  ])
    .then(async ([draftsResponse, syncTasksResponse]) => {
      const data = (await draftsResponse.json()) as DraftsResponse;
      const syncData = (await syncTasksResponse.json()) as SyncTasksResponse;

      if (!draftsResponse.ok) {
        throw new Error(data.error || '稿件读取失败，请稍后重试。');
      }
      if (!syncTasksResponse.ok) {
        throw new Error(syncData.error || '分发记录读取失败，请稍后重试。');
      }

      const nextData = {
        drafts: data.drafts ?? [],
        syncTasks: syncData.syncTasks ?? [],
      };
      draftLibraryData = nextData;
      return nextData;
    })
    .finally(() => {
      draftLibraryPromise = null;
    });

  return draftLibraryPromise;
}

export function prefetchDraftLibraryData() {
  void loadDraftLibraryData().catch(() => {});
}

export function getCachedSettingsPageData() {
  return settingsPageData;
}

export function setCachedSettingsPageData(data: SettingsPageData) {
  settingsPageData = data;
}

export async function loadSettingsPageData() {
  if (settingsPagePromise) return settingsPagePromise;

  settingsPagePromise = Promise.all([
    fetch('/api/settings', { cache: 'no-store' }),
    fetch('/api/platforms/connection/records', { cache: 'no-store' }),
  ])
    .then(async ([settingsRes, recordsRes]) => {
      const values = (await settingsRes.json()) as Record<string, string>;
      if (!settingsRes.ok) throw new Error('加载设置失败，请稍后重试');

      let connectionRecords = {} as Record<PlatformId, PlatformConnectionRecord>;
      if (recordsRes.ok) {
        const records = (await recordsRes.json()) as PlatformConnectionRecord[];
        connectionRecords = Object.fromEntries(records.map((r) => [r.platform, r])) as Record<
          PlatformId,
          PlatformConnectionRecord
        >;
      }

      const nextData = { values, connectionRecords };
      settingsPageData = nextData;
      return nextData;
    })
    .finally(() => {
      settingsPagePromise = null;
    });

  return settingsPagePromise;
}

export function prefetchSettingsPageData() {
  void loadSettingsPageData().catch(() => {});
}

export function getCachedHomePageChromeData() {
  return homePageChromeData;
}

export async function loadHomePageChromeData() {
  if (homePageChromePromise) return homePageChromePromise;

  homePageChromePromise = fetch('/api/agent/status')
    .then((response) => response.json())
    .catch(() => null)
    .then((agentStatus) => {
      const nextData = {
        agentEnabled: agentStatus?.available === true,
      };
      homePageChromeData = nextData;
      return nextData;
    })
    .finally(() => {
      homePageChromePromise = null;
    });

  return homePageChromePromise;
}

export function prefetchHomePageChromeData() {
  void loadHomePageChromeData().catch(() => {});
}
