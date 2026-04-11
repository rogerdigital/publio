import { createSyncHistoryStore } from '@/lib/sync/store';

type SyncHistoryStore = ReturnType<typeof createSyncHistoryStore>;

let syncHistoryStore: SyncHistoryStore = createSyncHistoryStore();

export function getSyncHistoryStore() {
  return syncHistoryStore;
}

export function resetSyncHistoryStoreForTests(
  options?: Parameters<typeof createSyncHistoryStore>[0],
) {
  syncHistoryStore = createSyncHistoryStore(options);
  return syncHistoryStore;
}
