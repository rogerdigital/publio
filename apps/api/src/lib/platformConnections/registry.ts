import { createConnectionRecordStore } from '@/lib/platformConnections';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type ConnectionRecordStoreOptions = Parameters<typeof createConnectionRecordStore>[0];

let connectionRecordStore = createConnectionRecordStore({
  storagePath: createLocalDataPath('platform-connections.json'),
});

export function getConnectionRecordStore() {
  return connectionRecordStore;
}

export function resetConnectionRecordStoreForTests(options: ConnectionRecordStoreOptions = {}) {
  connectionRecordStore = createConnectionRecordStore(options);
  return connectionRecordStore;
}
