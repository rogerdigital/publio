import type { PlatformId } from '@/types';
import type {
  CreateSyncTaskInput,
  PlatformSyncReceipt,
  SyncTask,
  SyncTaskStatus,
  UpdateSyncReceiptInput,
} from '@/lib/sync/types';
import {
  readJsonFileCollection,
  writeJsonFileCollection,
} from '@/lib/storage/jsonFileCollection';

interface SyncHistoryStoreOptions {
  createId?: () => string;
  now?: () => string;
  initialTasks?: SyncTask[];
  storagePath?: string;
}

function createDefaultId() {
  return `sync-${crypto.randomUUID()}`;
}

function createTimestamp() {
  return new Date().toISOString();
}

function sortByUpdatedAtDesc(left: SyncTask, right: SyncTask) {
  return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
}

function deriveTaskStatus(receipts: PlatformSyncReceipt[]): SyncTaskStatus {
  const hasCompletedReceipt = receipts.some(
    (receipt) => receipt.status === 'draft-created' || receipt.status === 'published',
  );

  if (receipts.some((receipt) => receipt.status === 'syncing')) {
    return 'syncing';
  }
  if (receipts.some((receipt) => receipt.status === 'needs-action')) {
    return hasCompletedReceipt ? 'partial' : 'needs-action';
  }
  if (receipts.some((receipt) => receipt.status === 'failed')) {
    return hasCompletedReceipt ? 'partial' : 'failed';
  }
  if (receipts.every((receipt) => receipt.status === 'draft-created' || receipt.status === 'published')) {
    return 'completed';
  }
  return 'pending';
}

export function createSyncHistoryStore(options: SyncHistoryStoreOptions = {}) {
  const createId = options.createId ?? createDefaultId;
  const now = options.now ?? createTimestamp;
  const storagePath = options.storagePath;
  const initialTasks = storagePath
    ? readJsonFileCollection<SyncTask>(storagePath)
    : (options.initialTasks ?? []);
  const tasks = new Map<string, SyncTask>(
    initialTasks.map((task) => [task.id, task]),
  );

  function persistTasks() {
    if (!storagePath) return;
    writeJsonFileCollection(storagePath, Array.from(tasks.values()));
  }

  return {
    createTask(input: CreateSyncTaskInput) {
      const timestamp = now();
      const task: SyncTask = {
        id: createId(),
        draftId: input.draftId,
        title: input.title,
        status: 'pending',
        createdAt: timestamp,
        updatedAt: timestamp,
        receipts: input.platforms.map((platform) => ({
          platform,
          status: 'pending',
          attempts: 0,
          updatedAt: timestamp,
        })),
      };

      tasks.set(task.id, task);
      persistTasks();
      return task;
    },

    getTask(id: string) {
      return tasks.get(id) ?? null;
    },

    updateReceipt(taskId: string, platform: PlatformId, input: UpdateSyncReceiptInput) {
      const current = tasks.get(taskId);
      if (!current) return null;

      const timestamp = now();
      let foundReceipt = false;
      const receipts = current.receipts.map((receipt) => {
        if (receipt.platform !== platform) return receipt;
        foundReceipt = true;
        return {
          ...receipt,
          ...input,
          attempts: receipt.attempts + 1,
          updatedAt: timestamp,
        };
      });

      if (!foundReceipt) return null;

      const updated: SyncTask = {
        ...current,
        receipts,
        status: deriveTaskStatus(receipts),
        updatedAt: timestamp,
      };

      tasks.set(taskId, updated);
      persistTasks();
      return updated;
    },

    listTasks() {
      return Array.from(tasks.values()).sort(sortByUpdatedAtDesc);
    },
  };
}

export type { SyncTask };
