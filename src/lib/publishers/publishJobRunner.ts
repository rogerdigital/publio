import type { PlatformId, PlatformPublishResult } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import type { SyncTask } from '@/lib/sync/types';
import {
  type PlatformPublishDrafts,
  inferFailureCode,
  publishToPlatforms,
  toDraftStatus,
  toNextAction,
  toSyncReceiptStatus,
} from '@/lib/publishers/executePublish';

export interface RunPublishJobInput {
  syncTaskId: string;
  title: string;
  content: string;
  platforms: PlatformId[];
  platformDrafts?: PlatformPublishDrafts;
  variantIds?: Record<string, string>;
  clearScheduledAt?: boolean;
}

export interface RunPublishJobResult {
  syncTask: SyncTask;
  results: PlatformPublishResult[];
}

function updateDraftFromTask(syncTask: SyncTask, clearScheduledAt?: boolean) {
  if (!syncTask.draftId) return;
  getDraftRegistry().updateDraft(syncTask.draftId, {
    status: toDraftStatus(syncTask.status),
    ...(clearScheduledAt ? { scheduledAt: undefined } : {}),
  });
}

function applyPublishResults(syncTask: SyncTask, results: PlatformPublishResult[]): SyncTask {
  const syncStore = getSyncHistoryStore();
  let updatedTask = syncTask;

  for (const result of results) {
    const receiptStatus = toSyncReceiptStatus(result);
    const isFailed = receiptStatus === 'failed';
    const failureCode = isFailed ? inferFailureCode(result.message) : undefined;
    const nextAction = isFailed && failureCode ? toNextAction(failureCode) : undefined;

    updatedTask =
      syncStore.updateReceipt(updatedTask.id, result.platform, {
        status: receiptStatus,
        message: result.message,
        url: result.url,
        failureCode,
        failureMessage: isFailed ? (result.message ?? '未知错误') : undefined,
        nextAction,
      }) ?? updatedTask;
  }

  return updatedTask;
}

function markVariantsPublished(
  platforms: PlatformId[],
  results: PlatformPublishResult[],
  variantIds?: Record<string, string>,
) {
  if (!variantIds) return;
  const variantRegistry = getPlatformVariantRegistry();
  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i];
    const result = results[i];
    const vid = variantIds[platform];
    if (vid && result && (result.status === 'success' || result.status === 'published')) {
      variantRegistry.updateVariant(vid, { status: 'published' });
    }
  }
}

export async function runPublishJob(input: RunPublishJobInput): Promise<RunPublishJobResult> {
  const syncStore = getSyncHistoryStore();
  let syncTask = syncStore.getTask(input.syncTaskId);
  if (!syncTask) {
    throw new Error(`Sync task not found: ${input.syncTaskId}`);
  }

  try {
    syncStore.appendTaskEvent(input.syncTaskId, { type: 'started' });
    const results = await publishToPlatforms(
      input.platforms,
      input.title,
      input.content,
      input.platformDrafts,
    );
    syncTask = applyPublishResults(syncTask, results);
    updateDraftFromTask(syncTask, input.clearScheduledAt);
    markVariantsPublished(input.platforms, results, input.variantIds);
    return { syncTask, results };
  } catch (error) {
    const message = error instanceof Error ? error.message : '发布过程中发生未知错误';
    const failedResults: PlatformPublishResult[] = input.platforms.map((platform) => ({
      platform,
      status: 'error',
      message,
    }));

    syncTask = applyPublishResults(syncTask, failedResults);
    updateDraftFromTask(syncTask, input.clearScheduledAt);
    return { syncTask, results: failedResults };
  }
}
