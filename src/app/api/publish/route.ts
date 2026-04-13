import { NextRequest, NextResponse } from 'next/server';
import { PlatformId } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import {
  type PlatformPublishDrafts,
  inferFailureCode,
  publishToPlatforms,
  toDraftStatus,
  toNextAction,
  toSyncReceiptStatus,
} from '@/lib/publishers/executePublish';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, title, content, platforms } = body;
    const platformDrafts: PlatformPublishDrafts =
      body.platformDrafts && typeof body.platformDrafts === 'object'
        ? body.platformDrafts
        : {};

    // Basic validation
    if (!title?.trim()) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 });
    }
    if (!content?.trim()) {
      return NextResponse.json({ error: '内容不能为空' }, { status: 400 });
    }
    if (!platforms?.length) {
      return NextResponse.json(
        { error: '请至少选择一个发布平台' },
        { status: 400 }
      );
    }

    // Platform-level draft validation
    const adaptations = adaptContentForPlatforms({
      title,
      content,
      platforms: platforms as PlatformId[],
    });
    const notReadyPlatforms = (platforms as PlatformId[]).filter((platform) => {
      const draft = platformDrafts[platform];
      const draftTitle = draft?.title ?? title;
      const draftContent = draft?.content ?? content;
      // Re-validate with the actual draft content that will be published
      return !draftTitle.trim() || !draftContent.trim();
    });
    if (notReadyPlatforms.length > 0) {
      return NextResponse.json(
        {
          error: `以下平台内容不完整，无法发布: ${notReadyPlatforms.join(', ')}`,
          notReadyPlatforms,
        },
        { status: 400 }
      );
    }
    // Suppress unused variable warning
    void adaptations;

    const publishResults = await publishToPlatforms(
      platforms as PlatformId[],
      title,
      content,
      platformDrafts,
    );

    const syncStore = getSyncHistoryStore();
    let syncTask = syncStore.createTask({
      draftId: typeof draftId === 'string' && draftId.trim() ? draftId.trim() : undefined,
      title,
      platforms: platforms as PlatformId[],
    });

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

    if (syncTask.draftId) {
      getDraftRegistry().updateDraft(syncTask.draftId, {
        status: toDraftStatus(syncTask.status),
      });
    }

    return NextResponse.json({ results: publishResults, syncTask });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
