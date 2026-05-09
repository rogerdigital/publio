// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockStore: Map<string, unknown[]> = new Map();
let uuidCounter = 0;

vi.mock('node:crypto', () => ({
  randomUUID: () => `test-uuid-${++uuidCounter}`,
}));

vi.mock('@/lib/storage/jsonFileCollection', () => ({
  readJsonFileCollection: (path: string) => mockStore.get(path) ?? [],
  writeJsonFileCollection: (path: string, data: unknown[]) => {
    mockStore.set(path, data);
  },
}));

vi.mock('@/lib/storage/localDataPath', () => ({
  createLocalDataPath: (name: string) => `/tmp/test-${name}`,
}));

// Static import so vi.mock can intercept
import {
  createCustomTemplate,
  deleteCustomTemplate,
  getAllCustomTemplates,
  getCustomTemplate,
  updateCustomTemplate,
} from '../customStore';

describe('customStore', () => {
  beforeEach(() => {
    mockStore.clear();
    uuidCounter = 0;
  });

  it('should create and retrieve a custom template', () => {
    const template = createCustomTemplate({
      name: 'Test Template',
      description: 'A test template',
      icon: '📝',
      title: 'Test Title',
      content: '## Hello\n\nWorld',
    });

    expect(template.id).toBe('custom-test-uuid-1');
    expect(template.name).toBe('Test Template');

    const all = getAllCustomTemplates();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(template.id);
  });

  it('should update a custom template', () => {
    const created = createCustomTemplate({
      name: 'Original',
      description: '',
      icon: '📝',
      title: '',
      content: 'content',
    });

    const updated = updateCustomTemplate(created.id, { name: 'Updated' });
    expect(updated?.name).toBe('Updated');

    const fetched = getCustomTemplate(created.id);
    expect(fetched?.name).toBe('Updated');
  });

  it('should delete a custom template', () => {
    const created = createCustomTemplate({
      name: 'To Delete',
      description: '',
      icon: '📝',
      title: '',
      content: 'content',
    });

    expect(deleteCustomTemplate(created.id)).toBe(true);
    expect(getCustomTemplate(created.id)).toBeUndefined();
  });

  it('should return null for updating non-existent template', () => {
    expect(updateCustomTemplate('non-existent', { name: 'X' })).toBeNull();
  });

  it('should return false for deleting non-existent template', () => {
    expect(deleteCustomTemplate('non-existent')).toBe(false);
  });

  it('should trim name and description on create', () => {
    const created = createCustomTemplate({
      name: '  Spaced Name  ',
      description: '  Spaced Desc  ',
      icon: '',
      title: '',
      content: 'content',
    });

    const fetched = getCustomTemplate(created.id);
    expect(fetched?.name).toBe('Spaced Name');
    expect(fetched?.description).toBe('Spaced Desc');
  });
});
