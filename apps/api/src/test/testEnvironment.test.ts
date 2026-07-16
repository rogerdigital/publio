import { describe, expect, it } from 'vitest';
import { validateTitle } from '@/lib/validation';

describe('api test project', () => {
  it('uses the API alias in a Node environment', () => {
    expect(globalThis).not.toHaveProperty('document');
    expect(validateTitle('有效标题')).toBeNull();
  });
});
