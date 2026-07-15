import type {
  PlatformVariant,
  CreatePlatformVariantInput,
  UpdatePlatformVariantInput,
} from '@/lib/platformVariants/types';
import type { PlatformId } from '@/types';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface PlatformVariantStoreOptions {
  createId?: () => string;
  now?: () => string;
  storagePath?: string;
  initialVariants?: PlatformVariant[];
}

function createDefaultId() {
  return `variant-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function sortByUpdatedAtDesc(a: PlatformVariant, b: PlatformVariant) {
  return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
}

function normalizeVariant(variant: PlatformVariant): PlatformVariant {
  return {
    ...variant,
    sourceDraftRevision:
      Number.isInteger(variant.sourceDraftRevision) && variant.sourceDraftRevision > 0
        ? variant.sourceDraftRevision
        : 1,
    stale: variant.stale === true,
  };
}

export function createPlatformVariantStore(options: PlatformVariantStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const initialVariants = storagePath
    ? readJsonFileCollection<PlatformVariant>(storagePath)
    : (options.initialVariants ?? []);
  const variants = new Map<string, PlatformVariant>(
    initialVariants.map((variant) => [variant.id, normalizeVariant(variant)]),
  );

  function persist() {
    if (!storagePath) return;
    writeMergedJsonFileCollection(storagePath, Array.from(variants.values()), (v) => v.id);
  }

  return {
    createVariant(input: CreatePlatformVariantInput): PlatformVariant {
      const timestamp = now();
      const variant: PlatformVariant = {
        id: createId(),
        draftId: input.draftId,
        platform: input.platform,
        title: input.title,
        content: input.content,
        status: 'synced',
        generatedByAgent: input.generatedByAgent ?? false,
        manuallyEdited: false,
        sourceDraftRevision: input.sourceDraftRevision,
        stale: false,
        lastSyncedFromDraftAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      variants.set(variant.id, variant);
      persist();
      return variant;
    },

    getVariant(id: string): PlatformVariant | null {
      return variants.get(id) ?? null;
    },

    getVariantByDraftAndPlatform(draftId: string, platform: PlatformId): PlatformVariant | null {
      for (const variant of variants.values()) {
        if (variant.draftId === draftId && variant.platform === platform) {
          return variant;
        }
      }
      return null;
    },

    updateVariant(id: string, input: UpdatePlatformVariantInput): PlatformVariant | null {
      const current = variants.get(id);
      if (!current) return null;

      const isContentChange = input.title !== undefined || input.content !== undefined;
      const updated: PlatformVariant = {
        ...current,
        ...input,
        manuallyEdited: input.manuallyEdited ?? (isContentChange ? true : current.manuallyEdited),
        status: input.status ?? (isContentChange ? 'edited' : current.status),
        updatedAt: now(),
      };

      variants.set(id, updated);
      persist();
      return updated;
    },

    deleteVariant(id: string): boolean {
      const existed = variants.has(id);
      if (existed) {
        variants.delete(id);
        persist();
      }
      return existed;
    },

    listVariantsByDraft(draftId: string): PlatformVariant[] {
      return Array.from(variants.values())
        .filter((v) => v.draftId === draftId)
        .sort(sortByUpdatedAtDesc);
    },

    markVariantsStale(draftId: string, currentDraftRevision: number): PlatformVariant[] {
      const timestamp = now();
      const changed: PlatformVariant[] = [];

      for (const variant of variants.values()) {
        if (
          variant.draftId !== draftId ||
          variant.sourceDraftRevision >= currentDraftRevision ||
          variant.stale
        ) {
          continue;
        }

        const updated: PlatformVariant = {
          ...variant,
          stale: true,
          updatedAt: timestamp,
        };
        variants.set(variant.id, updated);
        changed.push(updated);
      }

      if (changed.length > 0) persist();
      return changed;
    },

    syncVariantsFromDraft(
      draftId: string,
      title: string,
      content: string,
      platforms: PlatformId[],
      options: { sourceDraftRevision?: number; replaceProtected?: boolean } = {},
    ): PlatformVariant[] {
      const timestamp = now();
      const sourceDraftRevision = options.sourceDraftRevision ?? 1;
      const results: PlatformVariant[] = [];

      for (const platform of platforms) {
        const existing = this.getVariantByDraftAndPlatform(draftId, platform);

        if (existing) {
          const protectedContent =
            existing.manuallyEdited || existing.generatedByAgent || existing.status !== 'synced';
          if (protectedContent && !options.replaceProtected) {
            const updated: PlatformVariant = {
              ...existing,
              stale: existing.stale || existing.sourceDraftRevision < sourceDraftRevision,
              updatedAt: timestamp,
            };
            variants.set(existing.id, updated);
            results.push(updated);
            continue;
          }

          const updated: PlatformVariant = {
            ...existing,
            title,
            content,
            status: 'synced',
            generatedByAgent: false,
            manuallyEdited: false,
            changeSummary: undefined,
            sourceDraftRevision,
            stale: false,
            lastSyncedFromDraftAt: timestamp,
            updatedAt: timestamp,
          };
          variants.set(existing.id, updated);
          results.push(updated);
        } else {
          const variant: PlatformVariant = {
            id: createId(),
            draftId,
            platform,
            title,
            content,
            status: 'synced',
            generatedByAgent: false,
            manuallyEdited: false,
            sourceDraftRevision,
            stale: false,
            lastSyncedFromDraftAt: timestamp,
            createdAt: timestamp,
            updatedAt: timestamp,
          };
          variants.set(variant.id, variant);
          results.push(variant);
        }
      }

      persist();
      return results;
    },
  };
}
