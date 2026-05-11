import { createBriefStore } from '@/lib/briefs/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import { getTopicRegistry } from '@/lib/topics/registry';

type BriefStoreOptions = Parameters<typeof createBriefStore>[0];

let briefStore = createBriefStore({
  storagePath: createLocalDataPath('briefs.json'),
  topicLookup: getTopicRegistry(),
});

export function getBriefRegistry() {
  return briefStore;
}

export function resetBriefRegistryForTests(options: BriefStoreOptions = {}) {
  briefStore = createBriefStore(options);
  return briefStore;
}
