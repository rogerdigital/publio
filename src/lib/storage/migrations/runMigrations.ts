import { existsSync, readFileSync, writeFileSync, mkdirSync, cpSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type { Migration, SchemaVersion } from './types';

const SCHEMA_FILE = '_schema_version.json';
const BACKUP_DIR = '_backups';

function getSchemaVersion(dataDir: string): number {
  const path = join(dataDir, SCHEMA_FILE);
  if (!existsSync(path)) return 0;
  try {
    const data = JSON.parse(readFileSync(path, 'utf-8')) as SchemaVersion;
    return data.version;
  } catch {
    return 0;
  }
}

function setSchemaVersion(dataDir: string, version: number) {
  const path = join(dataDir, SCHEMA_FILE);
  const data: SchemaVersion = { version, migratedAt: new Date().toISOString() };
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
}

function backupDataDir(dataDir: string): string {
  const backupBase = join(dataDir, BACKUP_DIR);
  if (!existsSync(backupBase)) mkdirSync(backupBase, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = join(backupBase, `backup-${timestamp}`);
  mkdirSync(backupPath, { recursive: true });

  for (const entry of readdirSync(dataDir)) {
    if (entry === BACKUP_DIR) continue;
    const src = join(dataDir, entry);
    const dest = join(backupPath, entry);
    cpSync(src, dest, { recursive: true });
  }
  return backupPath;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: 'add-topicId-to-drafts',
    up(dataDir: string) {
      const path = join(dataDir, 'drafts.json');
      if (!existsSync(path)) return;
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      const items = Array.isArray(data) ? data : (data.items ?? []);
      let changed = false;
      for (const item of items) {
        if (!('topicId' in item)) {
          item.topicId = null;
          changed = true;
        }
        if (!('briefId' in item)) {
          item.briefId = null;
          changed = true;
        }
        if (!('contentGoal' in item)) {
          item.contentGoal = null;
          changed = true;
        }
      }
      if (changed) {
        const output = Array.isArray(data) ? items : { ...data, items };
        writeFileSync(path, JSON.stringify(output, null, 2), 'utf-8');
      }
    },
  },
  {
    version: 2,
    name: 'add-topicId-to-metrics',
    up(dataDir: string) {
      const path = join(dataDir, 'metrics.json');
      if (!existsSync(path)) return;
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      const items = Array.isArray(data) ? data : (data.items ?? []);
      let changed = false;
      for (const item of items) {
        if (!('topicId' in item)) {
          item.topicId = null;
          changed = true;
        }
        if (!('variantId' in item)) {
          item.variantId = null;
          changed = true;
        }
      }
      if (changed) {
        const output = Array.isArray(data) ? items : { ...data, items };
        writeFileSync(path, JSON.stringify(output, null, 2), 'utf-8');
      }
    },
  },
  {
    version: 3,
    name: 'add-events-to-sync-tasks',
    up(dataDir: string) {
      const path = join(dataDir, 'sync-tasks.json');
      if (!existsSync(path)) return;
      const data = JSON.parse(readFileSync(path, 'utf-8'));
      const items = Array.isArray(data) ? data : (data.items ?? []);
      let changed = false;
      for (const item of items) {
        if (!('events' in item) || !Array.isArray(item.events)) {
          item.events = [];
          changed = true;
        }
      }
      if (changed) {
        const output = Array.isArray(data) ? items : { ...data, items };
        writeFileSync(path, JSON.stringify(output, null, 2), 'utf-8');
      }
    },
  },
];

export function runMigrations(dataDir: string): { ran: string[]; backupPath?: string } {
  if (!existsSync(dataDir)) return { ran: [] };

  const currentVersion = getSchemaVersion(dataDir);
  const pending = migrations.filter((m) => m.version > currentVersion);

  if (pending.length === 0) return { ran: [] };

  const backupPath = backupDataDir(dataDir);

  const ran: string[] = [];
  for (const migration of pending) {
    try {
      migration.up(dataDir);
      ran.push(migration.name);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `Migration "${migration.name}" failed: ${msg}. Backup preserved at: ${backupPath}`,
      );
    }
  }

  const finalVersion = pending[pending.length - 1].version;
  setSchemaVersion(dataDir, finalVersion);

  return { ran, backupPath };
}

export const CURRENT_SCHEMA_VERSION = migrations[migrations.length - 1].version;
