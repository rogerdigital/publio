import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { WorkspaceBundle } from '../workspaceExport';

const mockCollections: Record<string, unknown[]> = {};

vi.mock('@/lib/storage/jsonFileCollection', () => ({
  readJsonFileCollection: (path: string) => mockCollections[path] ?? [],
  writeJsonFileCollection: (path: string, values: unknown[]) => {
    mockCollections[path] = values;
  },
}));

vi.mock('@/lib/storage/localDataPath', () => ({
  createLocalDataPath: (file: string) => `/data/${file}`,
}));

import {
  exportWorkspace,
  validateImportBundle,
  importDryRun,
  importWorkspace,
} from '../workspaceExport';
import { CURRENT_SCHEMA_VERSION } from '@/lib/storage/migrations/runMigrations';

describe('workspaceExport', () => {
  beforeEach(() => {
    Object.keys(mockCollections).forEach((k) => delete mockCollections[k]);
  });

  describe('exportWorkspace', () => {
    it('exports all collections with schema version', () => {
      mockCollections['/data/signals.json'] = [{ id: 's1' }];
      mockCollections['/data/drafts.json'] = [{ id: 'd1' }, { id: 'd2' }];

      const bundle = exportWorkspace();

      expect(bundle.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(bundle.exportedAt).toBeDefined();
      expect(bundle.data.signals).toEqual([{ id: 's1' }]);
      expect(bundle.data.drafts).toHaveLength(2);
      expect(bundle.data.topics).toEqual([]);
      expect(bundle.data.briefs).toEqual([]);
      expect(bundle.data.platformVariants).toEqual([]);
      expect(bundle.data.syncTasks).toEqual([]);
      expect(bundle.data.feedback).toEqual([]);
    });
  });

  describe('validateImportBundle', () => {
    it('rejects non-object input', () => {
      const result = validateImportBundle(null);
      expect(result.bundle).toBeNull();
      expect(result.errors).toContain('无效的导入文件格式');
    });

    it('rejects missing schemaVersion', () => {
      const result = validateImportBundle({ data: {} });
      expect(result.errors).toContain('缺少 schemaVersion 字段');
    });

    it('rejects future schema version', () => {
      const result = validateImportBundle({
        schemaVersion: CURRENT_SCHEMA_VERSION + 1,
        data: {},
      });
      expect(result.errors[0]).toContain('高于当前版本');
    });

    it('rejects non-array collections', () => {
      const result = validateImportBundle({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        data: { signals: 'not-array' },
      });
      expect(result.errors).toContain('data.signals 应为数组');
    });

    it('accepts valid bundle', () => {
      const result = validateImportBundle({
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: '2026-01-01',
        data: { signals: [], drafts: [{ id: 'd1' }] },
      });
      expect(result.bundle).not.toBeNull();
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('importDryRun', () => {
    it('reports add/update/skip counts', () => {
      mockCollections['/data/drafts.json'] = [{ id: 'd1' }];

      const bundle: WorkspaceBundle = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: '2026-01-01',
        data: {
          signals: [],
          topics: [],
          briefs: [],
          drafts: [{ id: 'd1' }, { id: 'd2' }, {}],
          platformVariants: [],
          syncTasks: [],
          feedback: [],
        },
      };

      const result = importDryRun(bundle);
      expect(result.valid).toBe(true);
      expect(result.counts.drafts).toEqual({ add: 1, update: 1, skip: 1 });
      expect(result.counts.signals).toEqual({ add: 0, update: 0, skip: 0 });
    });
  });

  describe('importWorkspace', () => {
    it('merges incoming data into existing collections', () => {
      mockCollections['/data/drafts.json'] = [{ id: 'd1', title: 'old' }];

      const bundle: WorkspaceBundle = {
        schemaVersion: CURRENT_SCHEMA_VERSION,
        exportedAt: '2026-01-01',
        data: {
          signals: [{ id: 's1' }],
          topics: [],
          briefs: [],
          drafts: [
            { id: 'd1', title: 'new' },
            { id: 'd2', title: 'added' },
          ],
          platformVariants: [],
          syncTasks: [],
          feedback: [],
        },
      };

      const result = importWorkspace(bundle);
      expect(result.counts.drafts).toEqual({ add: 1, update: 1, skip: 0 });
      expect(mockCollections['/data/drafts.json']).toEqual([
        { id: 'd1', title: 'new' },
        { id: 'd2', title: 'added' },
      ]);
      expect(mockCollections['/data/signals.json']).toEqual([{ id: 's1' }]);
    });
  });
});
