import { createPlatformVariantStore } from '@/lib/platformVariants/store';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

type PlatformVariantStoreOptions = Parameters<typeof createPlatformVariantStore>[0];

let variantStore = createPlatformVariantStore({
  storagePath: createLocalDataPath('platform-variants.json'),
});

export function getPlatformVariantRegistry() {
  return variantStore;
}

export function resetPlatformVariantRegistryForTests(options: PlatformVariantStoreOptions = {}) {
  variantStore = createPlatformVariantStore(options);
  return variantStore;
}
