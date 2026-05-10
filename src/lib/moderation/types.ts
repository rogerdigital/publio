export type SensitiveCategory =
  | 'political'
  | 'pornographic'
  | 'violent'
  | 'advertising'
  | 'general';

export interface SensitiveMatch {
  word: string;
  category: SensitiveCategory;
  position: number;
  length: number;
}

export interface ModerationResult {
  passed: boolean;
  matches: SensitiveMatch[];
}
