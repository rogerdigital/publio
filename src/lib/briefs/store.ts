import type {
  Brief,
  CreateBriefInput,
  UpdateBriefInput,
  ListBriefsOptions,
} from '@/lib/briefs/types';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface TopicLookup {
  getTopic(id: string): { id: string } | null;
}

interface BriefStoreOptions {
  createId?: () => string;
  now?: () => string;
  storagePath?: string;
  initialBriefs?: Brief[];
  topicLookup?: TopicLookup;
}

function createDefaultId() {
  return `brief-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function sortByUpdatedAtDesc(a: Brief, b: Brief) {
  return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
}

export function createBriefStore(options: BriefStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const topicLookup = options.topicLookup;
  const initialBriefs = storagePath
    ? readJsonFileCollection<Brief>(storagePath)
    : (options.initialBriefs ?? []);
  const briefs = new Map<string, Brief>(initialBriefs.map((b) => [b.id, b]));

  function persist() {
    if (!storagePath) return;
    writeMergedJsonFileCollection(storagePath, Array.from(briefs.values()), (b) => b.id);
  }

  return {
    createBrief(input: CreateBriefInput): Brief {
      if (!input.topicId) {
        throw new Error('Brief 必须关联一个选题');
      }

      if (topicLookup && !topicLookup.getTopic(input.topicId)) {
        throw new Error(`选题 ${input.topicId} 不存在`);
      }

      const timestamp = now();
      const brief: Brief = {
        id: createId(),
        topicId: input.topicId,
        workingTitle: input.workingTitle ?? '',
        thesis: input.thesis ?? '',
        audience: input.audience ?? '',
        tone: input.tone ?? '',
        outline: input.outline ?? [],
        sourceLinks: input.sourceLinks ?? [],
        platformPlan: input.platformPlan ?? [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      briefs.set(brief.id, brief);
      persist();
      return brief;
    },

    getBrief(id: string): Brief | null {
      return briefs.get(id) ?? null;
    },

    getBriefByTopicId(topicId: string): Brief | null {
      for (const brief of briefs.values()) {
        if (brief.topicId === topicId) return brief;
      }
      return null;
    },

    updateBrief(id: string, input: UpdateBriefInput): Brief | null {
      const current = briefs.get(id);
      if (!current) return null;

      const updated: Brief = {
        ...current,
        ...input,
        updatedAt: now(),
      };

      briefs.set(id, updated);
      persist();
      return updated;
    },

    deleteBrief(id: string): boolean {
      const existed = briefs.has(id);
      if (existed) {
        briefs.delete(id);
        persist();
      }
      return existed;
    },

    listBriefs(opts: ListBriefsOptions = {}): Brief[] {
      let results = Array.from(briefs.values());

      if (opts.topicId) {
        results = results.filter((b) => b.topicId === opts.topicId);
      }

      return results.sort(sortByUpdatedAtDesc);
    },
  };
}
