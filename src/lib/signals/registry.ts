import { createSignalStore } from '@/lib/signals/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type SignalStoreOptions = Parameters<typeof createSignalStore>[0];

let signalStore = createSignalStore({
  storagePath: createLocalDataPath('signals.json'),
});

export function getSignalRegistry() {
  return signalStore;
}

export function resetSignalRegistryForTests(options: SignalStoreOptions = {}) {
  signalStore = createSignalStore(options);
  return signalStore;
}
