import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();

function projectPath(path: string) {
  return join(root, path);
}

describe('core route surface', () => {
  test('keeps only the simplified product pages', () => {
    const corePages = ['src/app/page.tsx', 'src/app/drafts/page.tsx', 'src/app/settings/page.tsx'];

    for (const page of corePages) {
      expect(existsSync(projectPath(page)), `${page} should exist`).toBe(true);
    }

    const removedPages = [
      'src/app/ai-news',
      'src/app/analytics',
      'src/app/calendar',
      'src/app/feed',
      'src/app/sync-tasks',
    ];

    for (const page of removedPages) {
      expect(existsSync(projectPath(page)), `${page} should stay deleted`).toBe(false);
    }
  });

  test('keeps publish status APIs but removes non-core APIs', () => {
    const coreApis = [
      'src/app/api/agent/status/route.ts',
      'src/app/api/agent/write/route.ts',
      'src/app/api/agent/adapt/route.ts',
      'src/app/api/drafts/route.ts',
      'src/app/api/publish/route.ts',
      'src/app/api/publish/check/route.ts',
      'src/app/api/settings/route.ts',
      'src/app/api/sync-tasks/route.ts',
    ];

    for (const api of coreApis) {
      expect(existsSync(projectPath(api)), `${api} should exist`).toBe(true);
    }

    const removedApis = [
      'src/app/api/ai-news',
      'src/app/api/agent/brief',
      'src/app/api/agent/chat',
      'src/app/api/agent/diagnose',
      'src/app/api/agent/feedback',
      'src/app/api/agent/research',
      'src/app/api/agent/signal-review',
      'src/app/api/agent/topic-pack',
      'src/app/api/briefs',
      'src/app/api/copilot',
      'src/app/api/export',
      'src/app/api/import',
      'src/app/api/feedback',
      'src/app/api/metrics',
      'src/app/api/rss-sources',
      'src/app/api/scheduler',
      'src/app/api/signals',
      'src/app/api/topics',
    ];

    for (const api of removedApis) {
      expect(existsSync(projectPath(api)), `${api} should stay deleted`).toBe(false);
    }
  });

  test('keeps core domain modules and removes non-core modules', () => {
    const coreModules = [
      'src/lib/agent',
      'src/lib/drafts',
      'src/lib/platformAdapters',
      'src/lib/platformConnections',
      'src/lib/platformVariants',
      'src/lib/publishChecks',
      'src/lib/publishers',
      'src/lib/sync',
    ];

    for (const modulePath of coreModules) {
      expect(existsSync(projectPath(modulePath)), `${modulePath} should exist`).toBe(true);
    }

    const removedModules = [
      'src/lib/ai-news',
      'src/lib/briefs',
      'src/lib/copilot',
      'src/lib/export',
      'src/lib/feedback',
      'src/lib/metrics',
      'src/lib/rss-sources',
      'src/lib/scheduler',
      'src/lib/signals',
      'src/lib/topics',
    ];

    for (const modulePath of removedModules) {
      expect(existsSync(projectPath(modulePath)), `${modulePath} should stay deleted`).toBe(false);
    }
  });
});
