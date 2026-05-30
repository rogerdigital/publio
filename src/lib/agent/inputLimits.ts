export const AGENT_INPUT_LIMITS = {
  titleChars: 200,
  contentChars: 12_000,
  selectionChars: 4_000,
  customPromptChars: 2_000,
} as const;

export interface LimitedValue<T> {
  value: T;
  truncated: boolean;
}

export function limitText(value: string | undefined, maxChars: number): LimitedValue<string> {
  if (!value) return { value: '', truncated: false };
  if (value.length <= maxChars) return { value, truncated: false };
  return { value: value.slice(0, maxChars), truncated: true };
}

export function markTruncated(response: Response, truncated: boolean): Response {
  if (truncated) {
    response.headers.set('X-Agent-Input-Truncated', 'true');
  }
  return response;
}
