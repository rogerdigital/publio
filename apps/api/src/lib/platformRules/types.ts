import type { PlatformId } from '@/types';

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  severity: ValidationSeverity;
  field: 'title' | 'content' | 'images';
  message: string;
  current?: number;
  limit?: number;
}

export interface ValidationResult {
  passed: boolean; // true if no errors (warnings allowed)
  issues: ValidationIssue[];
}

export interface PlatformRule {
  platform: PlatformId;
  title?: { maxLength: number };
  content: { maxLength: number; minLength?: number };
  images?: { maxCount: number; required?: boolean };
}
