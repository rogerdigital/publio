import { NextRequest } from 'next/server';

import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import {
  inferFailureCode,
  publishToPlatforms,
  toDraftStatus,
  toNextAction,
  toSyncReceiptStatus,
} from '@/lib/publishers/executePublish';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface RetrySyncTaskRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(_request: NextRequest | Request, { params }: RetrySyncTaskRouteContext) {
  const { id } = await params;
  const syncStore = getSyncHistoryStore();
  let syncTask = syncStore.getTask(id);

  if (!syncTask) {
    return apiError('分发任务不存在', 404);
  }
  if (!syncTask.draftId) {
    return apiError('分发任务没有关联稿件，无法重试');
  }

  const draft = getDraftRegistry().getDraft(syncTask.draftId);
  if (!draft) {
    return apiError('关联稿件不存在，无法重试', 404);
  }

  const retryPlatforms = syncTask.receipts
    .filter((receipt) => receipt.status === 'failed')
    .filter((receipt) => receipt.failureCode !== 'auth-expired')
    .map((receipt) => receipt.platform);

  if (retryPlatforms.length === 0) {
    return apiError('没有可重试的平台（需要重新授权的平台请先前往设置页重新连接）');
  }

  const publishResults = await publishToPlatforms(retryPlatforms, draft.title, draft.content);

  syncStore.appendRetryEvent(syncTask.id);

  for (const result of publishResults) {
    const receiptStatus = toSyncReceiptStatus(result);
    const isFailed = receiptStatus === 'failed';
    const failureCode = isFailed ? inferFailureCode(result.message) : undefined;
    const nextAction = isFailed && failureCode ? toNextAction(failureCode) : undefined;

    syncTask =
      syncStore.updateReceipt(syncTask.id, result.platform, {
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
  });

  return apiResponse({
    syncTask,
    retriedPlatforms: retryPlatforms,
    results: publishResults,
  });
}
