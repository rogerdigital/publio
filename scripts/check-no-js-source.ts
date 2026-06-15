import { existsSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = process.cwd();
// First-party source roots across the pnpm workspace.
const sourceRoots = ['apps/web/src', 'apps/api/src', 'packages/shared-types/src', 'scripts'];
const blockedExtensions = new Set(['.js', '.mjs', '.cjs']);
const ignoredDirs = new Set(['.git', 'coverage', 'dist', 'node_modules']);

function walk(dirPath: string, hits: string[]) {
  const entries = readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoredDirs.has(entry.name)) {
      continue;
    }

    const absolutePath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walk(absolutePath, hits);
      continue;
    }

    const extension = entry.name.slice(entry.name.lastIndexOf('.'));
    if (blockedExtensions.has(extension)) {
      hits.push(relative(repoRoot, absolutePath));
    }
  }
}

function main() {
  const hits: string[] = [];

  for (const sourceRoot of sourceRoots) {
    const absoluteRoot = join(repoRoot, sourceRoot);
    if (!existsSync(absoluteRoot)) {
      continue;
    }
    walk(absoluteRoot, hits);
  }

  if (hits.length > 0) {
    console.error('JavaScript source files are not allowed in first-party source roots.');
    console.error('Migrate these files to TypeScript instead:');
    for (const hit of hits.sort()) {
      console.error(`- ${hit}`);
    }
    process.exitCode = 1;
    return;
  }

  console.info('No JavaScript source files found in first-party source roots.');
}

main();
