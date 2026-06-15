import { randomUUID } from 'node:crypto';
import { readJsonFileCollection, writeJsonFileCollection } from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { ContentTemplate } from './types';

const CUSTOM_TEMPLATES_FILE = createLocalDataPath('custom-templates.json');

function readAll(): ContentTemplate[] {
  return readJsonFileCollection<ContentTemplate>(CUSTOM_TEMPLATES_FILE);
}

function writeAll(data: ContentTemplate[]) {
  writeJsonFileCollection(CUSTOM_TEMPLATES_FILE, data);
}

export function getAllCustomTemplates(): ContentTemplate[] {
  return readAll();
}

export function getCustomTemplate(id: string): ContentTemplate | undefined {
  return readAll().find((t) => t.id === id);
}

export function createCustomTemplate(input: {
  name: string;
  description: string;
  icon: string;
  title: string;
  content: string;
}): ContentTemplate {
  const template: ContentTemplate = {
    id: `custom-${randomUUID()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    icon: input.icon || '📝',
    title: input.title,
    content: input.content,
  };

  const all = readAll();
  all.push(template);
  writeAll(all);
  return template;
}

export function updateCustomTemplate(
  id: string,
  input: Partial<Pick<ContentTemplate, 'name' | 'description' | 'icon' | 'title' | 'content'>>,
): ContentTemplate | null {
  const all = readAll();
  const index = all.findIndex((t) => t.id === id);
  if (index < 0) return null;

  all[index] = { ...all[index], ...input };
  writeAll(all);
  return all[index];
}

export function deleteCustomTemplate(id: string): boolean {
  const all = readAll();
  const index = all.findIndex((t) => t.id === id);
  if (index < 0) return false;

  all.splice(index, 1);
  writeAll(all);
  return true;
}
