import type {
  CreateSignalInput,
  ListSignalsOptions,
  Signal,
  SignalScore,
  UpdateSignalInput,
} from '@/lib/signals/types';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface SignalStoreOptions {
  createId?: () => string;
  now?: () => string;
  initialSignals?: Signal[];
  storagePath?: string;
}

function createDefaultId() {
  return `sig-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function defaultScore(): SignalScore {
  return {
    freshness: 0,
    relevance: 0,
    credibility: 0,
    writingPotential: 0,
    audienceFit: 0,
  };
}

function sortByCapturedAtDesc(left: Signal, right: Signal) {
  return Date.parse(right.capturedAt) - Date.parse(left.capturedAt);
}

function matchesQuery(signal: Signal, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    signal.title.toLowerCase().includes(lower) ||
    signal.summary.toLowerCase().includes(lower) ||
    (signal.author?.toLowerCase().includes(lower) ?? false)
  );
}

export function createSignalStore(options: SignalStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const initialSignals = storagePath
    ? readJsonFileCollection<Signal>(storagePath)
    : (options.initialSignals ?? []);
  const signals = new Map<string, Signal>(initialSignals.map((s) => [s.id, s]));

  function persist() {
    if (!storagePath) return;
    writeMergedJsonFileCollection(storagePath, Array.from(signals.values()), (s) => s.id);
  }

  return {
    createSignal(input: CreateSignalInput): Signal {
      const timestamp = now();
      const signal: Signal = {
        id: createId(),
        sourceId: input.sourceId,
        sourceType: input.sourceType,
        title: input.title,
        summary: input.summary,
        ...(input.url ? { url: input.url } : {}),
        ...(input.author ? { author: input.author } : {}),
        ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
        capturedAt: timestamp,
        status: 'new',
        tags: input.tags ?? [],
        score: { ...defaultScore(), ...input.score },
        ...(input.notes ? { notes: input.notes } : {}),
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      signals.set(signal.id, signal);
      persist();
      return signal;
    },

    getSignal(id: string): Signal | null {
      return signals.get(id) ?? null;
    },

    updateSignal(id: string, input: UpdateSignalInput): Signal | null {
      const current = signals.get(id);
      if (!current) return null;

      const updated: Signal = {
        ...current,
        ...input,
        ...(input.score ? { score: { ...current.score, ...input.score } } : {}),
        updatedAt: now(),
      };

      signals.set(id, updated);
      persist();
      return updated;
    },

    deleteSignal(id: string): boolean {
      const existed = signals.has(id);
      if (existed) {
        signals.delete(id);
        persist();
      }
      return existed;
    },

    listSignals(options: ListSignalsOptions = {}): Signal[] {
      let results = Array.from(signals.values());

      if (options.status) {
        results = results.filter((s) => s.status === options.status);
      }
      if (options.tag) {
        results = results.filter((s) => s.tags.includes(options.tag!));
      }
      if (options.sourceId) {
        results = results.filter((s) => s.sourceId === options.sourceId);
      }
      if (options.q) {
        results = results.filter((s) => matchesQuery(s, options.q!));
      }

      return results.sort(sortByCapturedAtDesc);
    },

    upsertSignalFromFeedItem(input: CreateSignalInput): Signal {
      const existing = Array.from(signals.values()).find((s) => {
        if (input.url && s.url && s.url === input.url) return true;
        if (s.title === input.title && s.sourceId === input.sourceId) return true;
        return false;
      });

      if (existing) {
        const updated: Signal = {
          ...existing,
          summary: input.summary || existing.summary,
          ...(input.author ? { author: input.author } : {}),
          ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
          ...(input.score ? { score: { ...existing.score, ...input.score } } : {}),
          updatedAt: now(),
        };
        signals.set(existing.id, updated);
        persist();
        return updated;
      }

      return this.createSignal(input);
    },
  };
}

export type {
  Signal,
  SignalStatus,
  SignalScore,
  CreateSignalInput,
  UpdateSignalInput,
} from '@/lib/signals/types';
