interface VariantFreshnessInput {
  stale: boolean;
}

interface VariantReplacementInput {
  manuallyEdited: boolean;
  generatedByAgent: boolean;
}

export function getVariantFreshnessLabel({ stale }: VariantFreshnessInput): string | null {
  return stale ? '主稿已更新' : null;
}

export function shouldConfirmVariantReplacement({
  manuallyEdited,
  generatedByAgent,
}: VariantReplacementInput): boolean {
  return manuallyEdited || generatedByAgent;
}
