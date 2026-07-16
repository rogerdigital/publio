import { describe, expect, it } from 'vitest';
import { getVariantFreshnessLabel, shouldConfirmVariantReplacement } from './presentation';

describe('platform variant presentation', () => {
  it('labels stale variants as updated from the main draft', () => {
    expect(getVariantFreshnessLabel({ stale: true })).toBe('主稿已更新');
    expect(getVariantFreshnessLabel({ stale: false })).toBeNull();
  });

  it('requires confirmation for manually edited or agent-generated variants', () => {
    expect(shouldConfirmVariantReplacement({ manuallyEdited: true, generatedByAgent: false })).toBe(
      true,
    );
    expect(shouldConfirmVariantReplacement({ manuallyEdited: false, generatedByAgent: true })).toBe(
      true,
    );
    expect(
      shouldConfirmVariantReplacement({ manuallyEdited: false, generatedByAgent: false }),
    ).toBe(false);
  });
});
