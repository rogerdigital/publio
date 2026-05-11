import { createTopicStore } from '@/lib/topics/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type TopicStoreOptions = Parameters<typeof createTopicStore>[0];

let topicStore = createTopicStore({
  storagePath: createLocalDataPath('topics.json'),
});

export function getTopicRegistry() {
  return topicStore;
}

export function resetTopicRegistryForTests(options: TopicStoreOptions = {}) {
  topicStore = createTopicStore(options);
  return topicStore;
}
