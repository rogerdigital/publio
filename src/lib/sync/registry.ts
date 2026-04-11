import { createSyncHistoryStore } from '@/lib/sync/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type SyncHistoryStore = ReturnType<typeof createSyncHistoryStore>;

let syncHistoryStore: SyncHistoryStore = createSyncHistoryStore({
  storagePath: createLocalDataPath('sync-tasks.json'),
});

export function getSyncHistoryStore() {
  return syncHistoryStore;
}

export function resetSyncHistoryStoreForTests(
  options?: Parameters<typeof createSyncHistoryStore>[0],
) {
  syncHistoryStore = createSyncHistoryStore(options);
  return syncHistoryStore;
}
