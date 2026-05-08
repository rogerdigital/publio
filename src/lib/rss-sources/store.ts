import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

export interface CustomRssSource {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  createdAt: string;
}

const SOURCES_FILE = createLocalDataPath('rss-sources.json');

function readAll(): CustomRssSource[] {
  return readJsonFileCollection<CustomRssSource>(SOURCES_FILE);
}

function writeAll(data: CustomRssSource[]) {
  writeJsonFileCollection(SOURCES_FILE, data);
}

export function getCustomSources(): CustomRssSource[] {
  return readAll();
}

export function getEnabledCustomSources(): CustomRssSource[] {
  return readAll().filter((s) => s.enabled);
}

export function addCustomSource(name: string, url: string): CustomRssSource {
  const all = readAll();
  const source: CustomRssSource = {
    id: `custom-${Date.now()}`,
    name: name.trim(),
    url: url.trim(),
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  all.push(source);
  writeAll(all);
  return source;
}

export function updateCustomSource(
  id: string,
  updates: Partial<Pick<CustomRssSource, 'name' | 'url' | 'enabled'>>,
): CustomRssSource | undefined {
  const all = readAll();
  const index = all.findIndex((s) => s.id === id);
  if (index < 0) return undefined;
  all[index] = { ...all[index], ...updates };
  writeAll(all);
  return all[index];
}

export function deleteCustomSource(id: string): boolean {
  const all = readAll();
  const filtered = all.filter((s) => s.id !== id);
  if (filtered.length === all.length) return false;
  writeAll(filtered);
  return true;
}
