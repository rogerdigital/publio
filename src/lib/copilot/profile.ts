import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { BrandProfile } from './types';

const PROFILE_FILE = createLocalDataPath('brand-profile.json');

function readAll(): BrandProfile[] {
  return readJsonFileCollection<BrandProfile>(PROFILE_FILE);
}

function writeAll(data: BrandProfile[]) {
  writeJsonFileCollection(PROFILE_FILE, data);
}

export function getBrandProfile(): BrandProfile | null {
  return readAll()[0] ?? null;
}

export function saveBrandProfile(profile: Omit<BrandProfile, 'updatedAt'>): BrandProfile {
  const entry: BrandProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  writeAll([entry]);
  return entry;
}
