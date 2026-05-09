import { describe, expect, test } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createLocalDataPath } from '@/lib/storage/localDataPath';
import {
  readJsonFileCollection,
  writeJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

describe('createLocalDataPath', () => {
  test('stores runtime data in the project local data directory by default', () => {
    expect(createLocalDataPath('drafts.json')).toBe(`${process.cwd()}/.publio-data/drafts.json`);
  });

  test('uses PUBLIO_DATA_DIR when tests or deployments need a custom location', () => {
    expect(createLocalDataPath('sync-tasks.json', '/tmp/publio-data')).toBe(
      '/tmp/publio-data/sync-tasks.json',
    );
  });
});

describe('json file collection writes', () => {
  test('merges by key before writing to avoid stale snapshot overwrite', () => {
    const dir = mkdtempSync(join(tmpdir(), 'publio-json-'));
    const filePath = join(dir, 'items.json');

    try {
      writeJsonFileCollection(filePath, [{ id: 'a', value: 1 }]);
      writeMergedJsonFileCollection(
        filePath,
        [
          { id: 'b', value: 2 },
          { id: 'a', value: 3 },
        ],
        (item) => item.id,
      );

      expect(readJsonFileCollection<{ id: string; value: number }>(filePath)).toEqual([
        { id: 'a', value: 3 },
        { id: 'b', value: 2 },
      ]);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
