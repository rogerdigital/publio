import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import {
  publishToPlatforms,
  toSyncReceiptStatus,
  inferFailureCode,
  toNextAction,
  toDraftStatus,
} from '@/lib/publishers/executePublish';
import type { PlatformId } from '@/types';

export async function checkDueDrafts() {
  const drafts = getDraftRegistry().listDrafts({ includeArchived: true });
  const now = new Date();

  const dueDrafts = drafts.filter(
    (d) =>
      d.scheduledAt &&
      new Date(d.scheduledAt) <= now &&
      d.status === 'draft' &&
      d.platforms &&
      d.platforms.length > 0,
  );

  for (const draft of dueDrafts) {
    // Mark as syncing to prevent duplicate execution
    getDraftRegistry().updateDraft(draft.id, { status: 'syncing' });

    const platforms = draft.platforms as PlatformId[];
    const syncStore = getSyncHistoryStore();
    let syncTask = syncStore.createTask({
      draftId: draft.id,
      title: draft.title,
      platforms,
    });

    try {
      const publishResults = await publishToPlatforms(
        platforms,
        draft.title,
        draft.content,
      );

      for (const result of publishResults) {
        const receiptStatus = toSyncReceiptStatus(result);
        const isFailed = receiptStatus === 'failed';
        const failureCode = isFailed ? inferFailureCode(result.message) : undefined;
        const nextAction = isFailed && failureCode ? toNextAction(failureCode) : undefined;

        syncTask = syncStore.updateReceipt(syncTask.id, result.platform, {
          status: receiptStatus,
          message: result.message,
          url: result.url,
          failureCode,
          failureMessage: isFailed ? (result.message ?? '未知错误') : undefined,
          nextAction,
        }) ?? syncTask;
      }

      getDraftRegistry().updateDraft(draft.id, {
        status: toDraftStatus(syncTask.status),
        scheduledAt: undefined,
      });
    } catch {
      getDraftRegistry().updateDraft(draft.id, { status: 'failed' });
    }
  }
}
