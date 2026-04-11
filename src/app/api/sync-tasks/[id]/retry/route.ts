import { NextRequest, NextResponse } from 'next/server';

import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import {
  publishToPlatforms,
  toDraftStatus,
  toSyncReceiptStatus,
} from '@/lib/publishers/executePublish';

export const dynamic = 'force-dynamic';

interface RetrySyncTaskRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  _request: NextRequest | Request,
  { params }: RetrySyncTaskRouteContext,
) {
  const { id } = await params;
  const syncStore = getSyncHistoryStore();
  let syncTask = syncStore.getTask(id);

  if (!syncTask) {
    return NextResponse.json({ error: '分发任务不存在' }, { status: 404 });
  }
  if (!syncTask.draftId) {
    return NextResponse.json({ error: '分发任务没有关联稿件，无法重试' }, { status: 400 });
  }

  const draft = getDraftRegistry().getDraft(syncTask.draftId);
  if (!draft) {
    return NextResponse.json({ error: '关联稿件不存在，无法重试' }, { status: 404 });
  }

  const retryPlatforms = syncTask.receipts
    .filter((receipt) => receipt.status === 'failed')
    .map((receipt) => receipt.platform);

  if (retryPlatforms.length === 0) {
    return NextResponse.json({ error: '没有可重试的平台' }, { status: 400 });
  }

  const publishResults = await publishToPlatforms(
    retryPlatforms,
    draft.title,
    draft.content,
  );

  for (const result of publishResults) {
    syncTask = syncStore.updateReceipt(syncTask.id, result.platform, {
      status: toSyncReceiptStatus(result),
      message: result.message,
      url: result.url,
    }) ?? syncTask;
  }

  getDraftRegistry().updateDraft(draft.id, {
    status: toDraftStatus(syncTask.status),
  });

  return NextResponse.json({
    syncTask,
    retriedPlatforms: retryPlatforms,
    results: publishResults,
  });
}
