import type { PlatformId } from '@/types';

export type PlatformConnectionStatus = 'connected' | 'available' | 'manual-required';

export type PlatformConnectionMode = 'oauth' | 'manual';

export interface PlatformConnectionDefinition {
  platform: PlatformId;
  mode: PlatformConnectionMode;
  requiredKeys: string[];
  optionalKeys?: string[];
  connectionLabel: string;
  connectionHint: string;
}

export interface PlatformConnectionProfile extends PlatformConnectionDefinition {
  status: PlatformConnectionStatus;
  configuredKeys: string[];
  missingKeys: string[];
  actionLabel: string;
}

export interface PlatformConnectionRecord {
  platform: PlatformId;
  accountName?: string;
  accountId?: string;
  connectedAt?: string;
  expiresAt?: string;
  lastCheckedAt?: string;
  failureReason?: string;
}

export interface ConnectionCheckResult {
  platform: PlatformId;
  ok: boolean;
  failureReason?: string;
  checkedAt: string;
}
