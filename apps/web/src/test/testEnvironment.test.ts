import { describe, expect, it } from 'vitest';
import { countCharacters } from '@/lib/contentStats';

describe('web test project', () => {
  it('uses the web alias in a jsdom environment', () => {
    expect(globalThis.document).toBeDefined();
    expect(countCharacters('Publio')).toBe(6);
  });
});
