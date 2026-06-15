import type { PlatformId } from '@/types';

export type PublishCheckSeverity = 'error' | 'warning' | 'info';

export interface PublishCheckResult {
  id: string;
  platform: PlatformId | 'global';
  severity: PublishCheckSeverity;
  message: string;
  nextAction: string;
  field?: string;
}

export interface PublishCheckSummary {
  canPublish: boolean;
  hasWarnings: boolean;
  checks: PublishCheckResult[];
  byPlatform: Record<string, PublishCheckResult[]>;
}
