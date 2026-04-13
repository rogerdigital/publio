import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

export function readJsonFileCollection<T>(filePath: string): T[] {
  if (!existsSync(filePath)) {
    return [];
  }

  const content = readFileSync(filePath, 'utf-8');
  if (!content.trim()) {
    return [];
  }

  const parsed = JSON.parse(content) as unknown;
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed as T[];
}

export function writeJsonFileCollection<T>(filePath: string, values: T[]) {
  mkdirSync(dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.tmp`;
  writeFileSync(tempPath, `${JSON.stringify(values, null, 2)}\n`, 'utf-8');
  renameSync(tempPath, filePath);
}
