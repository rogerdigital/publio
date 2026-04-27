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
import { validateTitle, validateContent, validatePlatforms } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, title, content, platforms } = body;
    const platformDrafts: PlatformPublishDrafts =
      body.platformDrafts && typeof body.platformDrafts === 'object'
        ? body.platformDrafts
        : {};

    // Basic validation
    const titleErr = validateTitle(title);
    if (titleErr) return NextResponse.json({ error: titleErr }, { status: 400 });
    const contentErr = validateContent(content);
    if (contentErr) return NextResponse.json({ error: contentErr }, { status: 400 });
    const platformErr = validatePlatforms(platforms);
    if (platformErr) return NextResponse.json({ error: platformErr }, { status: 400 });

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
    void adaptations;

    // Create sync task immediately so the UI can redirect to the detail page
    const syncStore = getSyncHistoryStore();
    let syncTask = syncStore.createTask({
      draftId: typeof draftId === 'string' && draftId.trim() ? draftId.trim() : undefined,
      title,
      platforms: platforms as PlatformId[],
    });

    // Execute publish in the background (fire-and-forget within the same process).
    // For a personal tool this is sufficient; swap for a real queue later.
    void (async () => {
      try {
        const publishResults = await publishToPlatforms(
          platforms as PlatformId[],
          title,
          content,
          platformDrafts,
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

        if (syncTask.draftId) {
          getDraftRegistry().updateDraft(syncTask.draftId, {
            status: toDraftStatus(syncTask.status),
          });
        }
      } catch {
        // Best-effort: mark all still-pending receipts as failed
        for (const platform of platforms as PlatformId[]) {
          const receipt = syncStore.getTask(syncTask.id)?.receipts.find(
            (r) => r.platform === platform && r.status === 'pending',
          );
          if (receipt) {
            syncStore.updateReceipt(syncTask.id, platform, {
              status: 'failed',
              failureCode: 'unknown',
              failureMessage: '发布过程中发生未知错误',
            });
          }
        }
      }
    })();

    // Return task ID immediately — client navigates to /sync-tasks/:id
    return NextResponse.json({ syncTaskId: syncTask.id, syncTask });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '服务器内部错误',
      },
      { status: 500 }
    );
  }
}
