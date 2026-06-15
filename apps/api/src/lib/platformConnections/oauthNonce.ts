import { randomUUID } from 'crypto';
import type { PlatformId } from '@/types';

const NONCE_TTL_MS = 10 * 60 * 1000; // 10 分钟

interface NonceEntry {
  platform: PlatformId;
  createdAt: number;
}

const nonceStore = new Map<string, NonceEntry>();

export function createNonce(platform: PlatformId): string {
  const nonce = randomUUID();
  nonceStore.set(nonce, { platform, createdAt: Date.now() });
  return nonce;
}

export function consumeNonce(nonce: string): PlatformId | null {
  const entry = nonceStore.get(nonce);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > NONCE_TTL_MS) {
    nonceStore.delete(nonce);
    return null;
  }
  nonceStore.delete(nonce);
  return entry.platform;
}
