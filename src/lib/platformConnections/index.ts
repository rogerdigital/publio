import type { PlatformId } from '@/types';
import type {
  ConnectionCheckResult,
  PlatformConnectionRecord,
} from '@/lib/platformConnections/types';
import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

// Re-export client-safe profile helpers and definitions
export {
  PLATFORM_CONNECTIONS,
  getPlatformConnectionProfiles,
  getPlatformConnectionProfile,
} from '@/lib/platformConnections/profiles';

// ---------------------------------------------------------------------------
// Connection record store (persists account metadata per platform)
// ---------------------------------------------------------------------------

interface ConnectionRecordStoreOptions {
  storagePath?: string;
  now?: () => string;
  initialRecords?: PlatformConnectionRecord[];
}

export function createConnectionRecordStore(options: ConnectionRecordStoreOptions = {}) {
  const now = options.now ?? (() => new Date().toISOString());
  const storagePath = options.storagePath;
  const initial = storagePath
    ? readJsonFileCollection<PlatformConnectionRecord>(storagePath)
    : (options.initialRecords ?? []);
  const records = new Map<PlatformId, PlatformConnectionRecord>(
    initial.map((r) => [r.platform, r]),
  );

  function persist() {
    if (!storagePath) return;
    writeJsonFileCollection(storagePath, Array.from(records.values()));
  }

  return {
    getRecord(platform: PlatformId): PlatformConnectionRecord | null {
      return records.get(platform) ?? null;
    },

    upsertRecord(platform: PlatformId, patch: Partial<Omit<PlatformConnectionRecord, 'platform'>>) {
      const existing = records.get(platform) ?? { platform };
      const updated: PlatformConnectionRecord = { ...existing, ...patch };
      records.set(platform, updated);
      persist();
      return updated;
    },

    clearRecord(platform: PlatformId) {
      records.delete(platform);
      persist();
    },

    markChecked(platform: PlatformId, result: ConnectionCheckResult) {
      const existing = records.get(platform) ?? { platform };
      const updated: PlatformConnectionRecord = {
        ...existing,
        lastCheckedAt: result.checkedAt,
        failureReason: result.ok ? undefined : (result.failureReason ?? '连接检查失败'),
      };
      records.set(platform, updated);
      persist();
      return updated;
    },

    listRecords(): PlatformConnectionRecord[] {
      return Array.from(records.values());
    },
  };
}

export type ConnectionRecordStore = ReturnType<typeof createConnectionRecordStore>;
