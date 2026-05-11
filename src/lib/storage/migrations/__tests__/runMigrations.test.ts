import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { runMigrations, CURRENT_SCHEMA_VERSION } from '../runMigrations';

const TEST_DIR = join(process.cwd(), '.test-migration-data');

function writeJson(filename: string, data: unknown) {
  writeFileSync(join(TEST_DIR, filename), JSON.stringify(data), 'utf-8');
}

function readJson(filename: string) {
  return JSON.parse(readFileSync(join(TEST_DIR, filename), 'utf-8'));
}

describe('runMigrations', () => {
  beforeEach(() => {
    mkdirSync(TEST_DIR, { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('skips when data dir does not exist', () => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    const result = runMigrations(TEST_DIR);
    expect(result.ran).toHaveLength(0);
  });

  it('creates backup before running migrations', () => {
    writeJson('drafts.json', [{ id: 'd1', title: 'test' }]);
    const result = runMigrations(TEST_DIR);
    expect(result.backupPath).toBeDefined();
    expect(existsSync(result.backupPath!)).toBe(true);
  });

  it('adds topicId/briefId/contentGoal to drafts', () => {
    writeJson('drafts.json', [{ id: 'd1', title: 'test' }]);
    runMigrations(TEST_DIR);
    const drafts = readJson('drafts.json');
    expect(drafts[0].topicId).toBeNull();
    expect(drafts[0].briefId).toBeNull();
    expect(drafts[0].contentGoal).toBeNull();
  });

  it('adds topicId/variantId to metrics', () => {
    writeJson('metrics.json', [{ syncTaskId: 't1', platforms: [] }]);
    runMigrations(TEST_DIR);
    const metrics = readJson('metrics.json');
    expect(metrics[0].topicId).toBeNull();
    expect(metrics[0].variantId).toBeNull();
  });

  it('adds events to sync tasks', () => {
    writeJson('sync-tasks.json', [{ id: 't1', status: 'completed', receipts: [] }]);
    runMigrations(TEST_DIR);
    const tasks = readJson('sync-tasks.json');
    expect(tasks[0].events).toEqual([]);
  });

  it('is idempotent — second run does nothing', () => {
    writeJson('drafts.json', [{ id: 'd1', title: 'test' }]);
    const first = runMigrations(TEST_DIR);
    expect(first.ran.length).toBeGreaterThan(0);

    const second = runMigrations(TEST_DIR);
    expect(second.ran).toHaveLength(0);
    expect(second.backupPath).toBeUndefined();
  });

  it('sets schema version after migration', () => {
    writeJson('drafts.json', []);
    runMigrations(TEST_DIR);
    const schema = readJson('_schema_version.json');
    expect(schema.version).toBe(CURRENT_SCHEMA_VERSION);
  });
});
