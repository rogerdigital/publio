import { randomUUID } from 'crypto';
import {
  readJsonFileCollection,
  writeMergedJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type {
  Feedback,
  CreateFeedbackInput,
  UpdateFeedbackInput,
  ListFeedbackOptions,
} from './types';

const FEEDBACK_FILE = createLocalDataPath('feedback.json');

function readAll(): Feedback[] {
  return readJsonFileCollection<Feedback>(FEEDBACK_FILE);
}

function writeAll(data: Feedback[]) {
  writeMergedJsonFileCollection(FEEDBACK_FILE, data, (f) => f.id);
}

export function getFeedbackStore() {
  return {
    listFeedback(options?: ListFeedbackOptions): Feedback[] {
      let all = readAll();
      if (options?.draftId) all = all.filter((f) => f.draftId === options.draftId);
      if (options?.topicId) all = all.filter((f) => f.topicId === options.topicId);
      if (options?.platform) all = all.filter((f) => f.platform === options.platform);
      return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    getFeedback(id: string): Feedback | null {
      return readAll().find((f) => f.id === id) ?? null;
    },

    getFeedbackByDraft(draftId: string): Feedback[] {
      return readAll()
        .filter((f) => f.draftId === draftId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    getFeedbackByTopic(topicId: string): Feedback[] {
      return readAll()
        .filter((f) => f.topicId === topicId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    createFeedback(input: CreateFeedbackInput): Feedback {
      const now = new Date().toISOString();
      const feedback: Feedback = {
        id: randomUUID(),
        draftId: input.draftId,
        variantId: input.variantId,
        topicId: input.topicId,
        platform: input.platform,
        metricSnapshotId: input.metricSnapshotId,
        summary: input.summary,
        learnings: input.learnings ?? [],
        nextActions: input.nextActions ?? [],
        source: input.source ?? 'manual',
        createdAt: now,
        updatedAt: now,
      };
      const all = readAll();
      all.push(feedback);
      writeAll(all);
      return feedback;
    },

    updateFeedback(id: string, input: UpdateFeedbackInput): Feedback | null {
      const all = readAll();
      const index = all.findIndex((f) => f.id === id);
      if (index < 0) return null;
      const updated: Feedback = {
        ...all[index],
        ...input,
        updatedAt: new Date().toISOString(),
      };
      all[index] = updated;
      writeAll(all);
      return updated;
    },
  };
}
