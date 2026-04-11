import { NextRequest, NextResponse } from 'next/server';
import { PlatformId, PlatformPublishResult } from '@/types';
import { Publisher, PublishInput } from '@/lib/publishers/types';
import { markdownToHtml, markdownToStyledHtml } from '@/lib/markdown';
import { WechatPublisher } from '@/lib/publishers/wechat';
import { XiaohongshuPublisher } from '@/lib/publishers/xiaohongshu';
import { ZhihuPublisher } from '@/lib/publishers/zhihu';
import { XPublisher } from '@/lib/publishers/x';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import type { SyncReceiptStatus } from '@/lib/sync/types';

const publisherMap: Record<PlatformId, () => Publisher> = {
  wechat: () => new WechatPublisher(),
  xiaohongshu: () => new XiaohongshuPublisher(),
  zhihu: () => new ZhihuPublisher(),
  x: () => new XPublisher(),
};

function toSyncReceiptStatus(result: PlatformPublishResult): SyncReceiptStatus {
  if (result.status === 'draft-created') return 'draft-created';
  if (result.status === 'published' || result.status === 'success') return 'published';
  if (result.status === 'needs-action') return 'needs-action';
  if (result.status === 'pending' || result.status === 'publishing') return 'syncing';
  return 'failed';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, title, content, platforms } = body;

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

    // Execute all publishers concurrently
    const publishPromises = (platforms as PlatformId[]).map(
      async (platformId): Promise<PlatformPublishResult> => {
        const createPublisher = publisherMap[platformId];
        if (!createPublisher) {
          return {
            platform: platformId,
            status: 'error',
            message: `不支持的平台: ${platformId}`,
          };
        }

        const publisher = createPublisher();
        const htmlContent =
          platformId === 'wechat' || platformId === 'zhihu'
            ? markdownToStyledHtml(title, content, platformId)
            : markdownToHtml(content);
        const input: PublishInput = {
          title,
          markdownContent: content,
          htmlContent,
        };
        const result = await publisher.publish(input);

        return {
          platform: result.platform,
          status: result.success ? 'success' : 'error',
          message: result.message,
          url: result.url,
        };
      }
    );

    const results = await Promise.allSettled(publishPromises);

    const publishResults: PlatformPublishResult[] = results.map(
      (result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }
        return {
          platform: platforms[index] as PlatformId,
          status: 'error' as const,
          message:
            result.reason instanceof Error
              ? result.reason.message
              : '未知错误',
        };
      }
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
