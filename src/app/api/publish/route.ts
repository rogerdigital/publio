import { NextRequest, NextResponse } from 'next/server';
import { PlatformId } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import {
  type PlatformPublishDrafts,
  publishToPlatforms,
  toDraftStatus,
  toSyncReceiptStatus,
} from '@/lib/publishers/executePublish';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, title, content, platforms } = body;
    const platformDrafts: PlatformPublishDrafts =
      body.platformDrafts && typeof body.platformDrafts === 'object'
        ? body.platformDrafts
        : {};

    // Validate
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
      syncTask = syncStore.updateReceipt(syncTask.id, result.platform, {
        status: toSyncReceiptStatus(result),
        message: result.message,
        url: result.url,
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
