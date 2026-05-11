import type {
  CreateTopicInput,
  ListTopicsOptions,
  Topic,
  TopicStatus,
  UpdateTopicInput,
} from '@/lib/topics/types';
import type { Signal } from '@/lib/signals/types';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface TopicStoreOptions {
  createId?: () => string;
  now?: () => string;
  initialTopics?: Topic[];
  storagePath?: string;
}

function createDefaultId() {
  return `topic-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function sortByUpdatedAtDesc(left: Topic, right: Topic) {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function matchesQuery(topic: Topic, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    topic.title.toLowerCase().includes(lower) ||
    topic.summary.toLowerCase().includes(lower) ||
    topic.angle.toLowerCase().includes(lower)
  );
}

function defaultPlatforms(): PlatformId[] {
  return PLATFORMS.filter((p) => p.enabled).map((p) => p.id);
}

const VALID_TRANSITIONS: Record<TopicStatus, TopicStatus[]> = {
  idea: ['researching', 'briefed', 'drafting', 'published', 'archived'],
  researching: ['idea', 'briefed', 'drafting', 'published', 'archived'],
  briefed: ['idea', 'researching', 'drafting', 'published', 'archived'],
  drafting: ['idea', 'researching', 'briefed', 'published', 'archived'],
  published: ['archived'],
  archived: ['idea', 'researching', 'briefed', 'drafting', 'published'],
};

function isValidTransition(from: TopicStatus, to: TopicStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function createTopicStore(options: TopicStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const initialTopics = storagePath
    ? readJsonFileCollection<Topic>(storagePath)
    : (options.initialTopics ?? []);
  const topics = new Map<string, Topic>(initialTopics.map((t) => [t.id, t]));

  function persist() {
    if (!storagePath) return;
    writeMergedJsonFileCollection(storagePath, Array.from(topics.values()), (t) => t.id);
  }

  return {
    createTopic(input: CreateTopicInput): Topic {
      const timestamp = now();
      const topic: Topic = {
        id: createId(),
        title: input.title,
        angle: input.angle ?? '',
        summary: input.summary ?? '',
        signalIds: input.signalIds ?? [],
        status: 'idea',
        tags: input.tags ?? [],
        ...(input.targetAudience ? { targetAudience: input.targetAudience } : {}),
        recommendedPlatforms: input.recommendedPlatforms ?? defaultPlatforms(),
        writingValue: input.writingValue ?? 0,
        urgency: input.urgency ?? 0,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      topics.set(topic.id, topic);
      persist();
      return topic;
    },

    getTopic(id: string): Topic | null {
      return topics.get(id) ?? null;
    },

    updateTopic(id: string, input: UpdateTopicInput): Topic | null {
      const current = topics.get(id);
      if (!current) return null;

      if (input.status && input.status !== current.status) {
        if (!isValidTransition(current.status, input.status)) {
          return null;
        }
      }

      const updated: Topic = {
        ...current,
        ...input,
        updatedAt: now(),
      };

      topics.set(id, updated);
      persist();
      return updated;
    },

    archiveTopic(id: string): Topic | null {
      return this.updateTopic(id, { status: 'archived' });
    },

    listTopics(options: ListTopicsOptions = {}): Topic[] {
      let results = Array.from(topics.values());

      if (options.status) {
        results = results.filter((t) => t.status === options.status);
      }
      if (options.tag) {
        results = results.filter((t) => t.tags.includes(options.tag!));
      }
      if (options.q) {
        results = results.filter((t) => matchesQuery(t, options.q!));
      }

      return results.sort(sortByUpdatedAtDesc);
    },

    createTopicFromSignals(signals: Signal[]): Topic {
      if (signals.length === 0) {
        throw new Error('至少需要一条信号来创建选题');
      }

      const primary = signals[0];
      const title =
        signals.length === 1 ? primary.title : `${primary.title} 等 ${signals.length} 条相关资讯`;
      const summary = signals
        .map((s) => s.summary)
        .filter(Boolean)
        .slice(0, 3)
        .join(' | ');
      const signalIds = signals.map((s) => s.id);
      const tags = [...new Set(signals.flatMap((s) => s.tags))].slice(0, 10);

      const maxWritingPotential = Math.max(...signals.map((s) => s.score.writingPotential), 0);

      return this.createTopic({
        title,
        summary,
        signalIds,
        tags,
        writingValue: maxWritingPotential,
        urgency: signals.length > 1 ? 0.5 : 0,
      });
    },
  };
}

export type { Topic, TopicStatus, CreateTopicInput, UpdateTopicInput } from '@/lib/topics/types';
