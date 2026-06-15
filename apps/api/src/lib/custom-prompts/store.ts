import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { PlatformId } from '@/types';

export interface CustomPrompt {
  platform: PlatformId | 'global';
  prefix: string;
  updatedAt: string;
}

const PROMPTS_FILE = createLocalDataPath('custom-prompts.json');

function readAll(): CustomPrompt[] {
  return readJsonFileCollection<CustomPrompt>(PROMPTS_FILE);
}

function writeAll(data: CustomPrompt[]) {
  writeMergedJsonFileCollection(PROMPTS_FILE, data, (prompt) => prompt.platform);
}

export function getCustomPrompt(platform: PlatformId | 'global'): string | undefined {
  return readAll().find((p) => p.platform === platform)?.prefix;
}

export function setCustomPrompt(platform: PlatformId | 'global', prefix: string): CustomPrompt {
  const all = readAll();
  const index = all.findIndex((p) => p.platform === platform);
  const entry: CustomPrompt = {
    platform,
    prefix: prefix.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (index >= 0) {
    all[index] = entry;
  } else {
    all.push(entry);
  }
  writeAll(all);
  return entry;
}

export function getAllCustomPrompts(): CustomPrompt[] {
  return readAll();
}
