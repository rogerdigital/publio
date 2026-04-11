import { describe, expect, test } from 'vitest';

import { createLocalDataPath } from '@/lib/storage/localDataPath';

describe('createLocalDataPath', () => {
  test('stores runtime data in the project local data directory by default', () => {
    expect(createLocalDataPath('drafts.json')).toBe(
      `${process.cwd()}/.publio-data/drafts.json`,
    );
  });

  test('uses PUBLIO_DATA_DIR when tests or deployments need a custom location', () => {
    expect(createLocalDataPath('sync-tasks.json', '/tmp/publio-data')).toBe(
      '/tmp/publio-data/sync-tasks.json',
    );
  });
});
