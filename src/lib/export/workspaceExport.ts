import { readJsonFileCollection, writeJsonFileCollection } from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import { CURRENT_SCHEMA_VERSION } from '@/lib/storage/migrations/runMigrations';

export interface WorkspaceBundle {
  schemaVersion: number;
  exportedAt: string;
  data: {
    signals: unknown[];
    topics: unknown[];
    briefs: unknown[];
    drafts: unknown[];
    platformVariants: unknown[];
    syncTasks: unknown[];
    feedback: unknown[];
  };
}

const COLLECTION_FILES = {
  signals: 'signals.json',
  topics: 'topics.json',
  briefs: 'briefs.json',
  drafts: 'drafts.json',
  platformVariants: 'platform-variants.json',
  syncTasks: 'sync-tasks.json',
  feedback: 'feedback.json',
} as const;

export type CollectionKey = keyof typeof COLLECTION_FILES;

export function exportWorkspace(): WorkspaceBundle {
  const data = {} as WorkspaceBundle['data'];

  for (const [key, file] of Object.entries(COLLECTION_FILES)) {
    const path = createLocalDataPath(file);
    data[key as CollectionKey] = readJsonFileCollection(path);
  }

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
}

export interface ImportDryRunResult {
  valid: boolean;
  errors: string[];
  counts: Record<CollectionKey, { add: number; update: number; skip: number }>;
}

export function validateImportBundle(raw: unknown): {
  bundle: WorkspaceBundle | null;
  errors: string[];
} {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    errors.push('无效的导入文件格式');
    return { bundle: null, errors };
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj.schemaVersion !== 'number') {
    errors.push('缺少 schemaVersion 字段');
  }

  if (obj.schemaVersion && (obj.schemaVersion as number) > CURRENT_SCHEMA_VERSION) {
    errors.push(
      `导入文件版本 (${obj.schemaVersion}) 高于当前版本 (${CURRENT_SCHEMA_VERSION})，请先升级应用`,
    );
  }

  if (!obj.data || typeof obj.data !== 'object') {
    errors.push('缺少 data 字段');
    return { bundle: null, errors };
  }

  const data = obj.data as Record<string, unknown>;
  for (const key of Object.keys(COLLECTION_FILES)) {
    if (data[key] !== undefined && !Array.isArray(data[key])) {
      errors.push(`data.${key} 应为数组`);
    }
  }

  if (errors.length > 0) return { bundle: null, errors };

  return { bundle: obj as unknown as WorkspaceBundle, errors: [] };
}

export function importDryRun(bundle: WorkspaceBundle): ImportDryRunResult {
  const counts = {} as ImportDryRunResult['counts'];

  for (const [key, file] of Object.entries(COLLECTION_FILES)) {
    const existing = readJsonFileCollection<{ id: string }>(createLocalDataPath(file));
    const existingIds = new Set(existing.map((item) => item.id));
    const incoming = (bundle.data[key as CollectionKey] ?? []) as { id?: string }[];

    let add = 0;
    let update = 0;
    let skip = 0;

    for (const item of incoming) {
      if (!item.id) {
        skip++;
      } else if (existingIds.has(item.id)) {
        update++;
      } else {
        add++;
      }
    }

    counts[key as CollectionKey] = { add, update, skip };
  }

  return { valid: true, errors: [], counts };
}

export function importWorkspace(bundle: WorkspaceBundle): ImportDryRunResult {
  const dryResult = importDryRun(bundle);

  for (const [key, file] of Object.entries(COLLECTION_FILES)) {
    const path = createLocalDataPath(file);
    const existing = readJsonFileCollection<{ id: string }>(path);
    const existingMap = new Map(existing.map((item) => [item.id, item]));
    const incoming = (bundle.data[key as CollectionKey] ?? []) as { id?: string }[];

    for (const item of incoming) {
      if (item.id) {
        existingMap.set(item.id, item as { id: string });
      }
    }

    writeJsonFileCollection(path, Array.from(existingMap.values()));
  }

  return dryResult;
}
