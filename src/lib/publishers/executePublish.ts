import type { PlatformId, PlatformPublishResult } from '@/types';
import { markdownToHtml, markdownToStyledHtml } from '@/lib/markdown';
import type { Publisher, PublishInput } from '@/lib/publishers/types';
import { WechatPublisher } from '@/lib/publishers/wechat';
import { XiaohongshuPublisher } from '@/lib/publishers/xiaohongshu';
import { ZhihuPublisher } from '@/lib/publishers/zhihu';
import { XPublisher } from '@/lib/publishers/x';
import { resolveLocalImages, type PlatformImageContext } from '@/lib/publishers/imageUpload';
import { getWechatConfig, getZhihuConfig, getXhsConfig } from '@/lib/config';
import type {
  SyncFailureCode,
  SyncNextAction,
  SyncReceiptStatus,
  SyncTaskStatus,
} from '@/lib/sync/types';
import type { DraftStatus } from '@/lib/drafts/types';

export type PlatformPublishDrafts = Partial<
  Record<
    PlatformId,
    {
      title: string;
      content: string;
    }
  >
>;

const publisherMap: Record<PlatformId, () => Publisher> = {
  wechat: () => new WechatPublisher(),
  xiaohongshu: () => new XiaohongshuPublisher(),
  zhihu: () => new ZhihuPublisher(),
  x: () => new XPublisher(),
};

export function toSyncReceiptStatus(result: PlatformPublishResult): SyncReceiptStatus {
  if (result.status === 'draft-created') return 'draft-created';
  if (result.status === 'published' || result.status === 'success') return 'published';
  if (result.status === 'needs-action') return 'needs-action';
  if (result.status === 'pending' || result.status === 'publishing') return 'syncing';
  return 'failed';
}

export function inferFailureCode(message: string | undefined): SyncFailureCode {
  if (!message) return 'unknown';
  const lower = message.toLowerCase();
  if (lower.includes('缺少') || lower.includes('missing') || lower.includes('not configured')) {
    return 'auth-missing';
  }
  if (
    lower.includes('auth') ||
    lower.includes('token') ||
    lower.includes('unauthorized') ||
    lower.includes('401') ||
    lower.includes('expired')
  ) {
    return 'auth-expired';
  }
  if (
    lower.includes('rate') ||
    lower.includes('limit') ||
    lower.includes('429') ||
    lower.includes('too many')
  ) {
    return 'rate-limited';
  }
  if (lower.includes('rejected') || lower.includes('违规') || lower.includes('sensitive')) {
    return 'content-rejected';
  }
  if (
    lower.includes('content') ||
    lower.includes('invalid') ||
    lower.includes('format') ||
    lower.includes('400')
  ) {
    return 'invalid-content';
  }
  if (
    lower.includes('unavailable') ||
    lower.includes('503') ||
    lower.includes('502') ||
    lower.includes('maintenance')
  ) {
    return 'platform-unavailable';
  }
  if (
    lower.includes('network') ||
    lower.includes('timeout') ||
    lower.includes('connect') ||
    lower.includes('fetch')
  ) {
    return 'network-error';
  }
  return 'unknown';
}

export function toNextAction(failureCode: SyncFailureCode): SyncNextAction {
  switch (failureCode) {
    case 'auth-missing':
      return 'reconnect';
    case 'auth-expired':
      return 'reconnect';
    case 'rate-limited':
      return 'wait-and-retry';
    case 'content-rejected':
      return 'fix-content';
    case 'invalid-content':
      return 'fix-content';
    case 'network-error':
      return 'wait-and-retry';
    case 'platform-unavailable':
      return 'wait-and-retry';
    case 'manual-required':
      return 'open-platform';
    default:
      return 'contact-support';
  }
}

export function toDraftStatus(status: SyncTaskStatus): DraftStatus {
  if (status === 'completed') return 'synced';
  if (status === 'failed' || status === 'partial') return 'failed';
  return 'syncing';
}

export async function publishToPlatform(
  platformId: PlatformId,
  title: string,
  content: string,
): Promise<PlatformPublishResult> {
  const createPublisher = publisherMap[platformId];
  if (!createPublisher) {
    return {
      platform: platformId,
      status: 'error',
      message: `不支持的平台: ${platformId}`,
    };
  }

  const publisher = createPublisher();

  // Build image context for local image resolution
  const imageContext: PlatformImageContext = {};
  if (platformId === 'wechat') {
    // WeChat publisher will handle token internally, but we need one for image upload
    const wechatPublisher = publisher as WechatPublisher;
    try {
      imageContext.wechatToken = await wechatPublisher.getAccessTokenForImages();
    } catch {
      /* proceed without image upload */
    }
  } else if (platformId === 'zhihu') {
    imageContext.zhihuCookie = getZhihuConfig().cookie;
  } else if (platformId === 'xiaohongshu') {
    imageContext.xhsAccessToken = getXhsConfig().accessToken;
  }

  let htmlContent =
    platformId === 'wechat' || platformId === 'zhihu'
      ? markdownToStyledHtml(title, content, platformId)
      : markdownToHtml(content);
  let markdownContent = content;

  // Resolve local images: upload to platform and replace URLs
  const resolved = await resolveLocalImages(markdownContent, htmlContent, platformId, imageContext);
  markdownContent = resolved.markdownContent;
  htmlContent = resolved.htmlContent;

  const input: PublishInput = {
    title,
    markdownContent,
    htmlContent,
    xhsImageIds: resolved.xhsImageIds,
  };
  const result = await publisher.publish(input);

  return {
    platform: result.platform,
    status: result.success ? 'success' : 'error',
    message: result.message,
    url: result.url,
  };
}

export async function publishToPlatforms(
  platforms: PlatformId[],
  title: string,
  content: string,
  platformDrafts: PlatformPublishDrafts = {},
): Promise<PlatformPublishResult[]> {
  const results = await Promise.allSettled(
    platforms.map((platformId) => {
      const platformDraft = platformDrafts[platformId];
      return publishToPlatform(
        platformId,
        platformDraft?.title ?? title,
        platformDraft?.content ?? content,
      );
    }),
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }

    return {
      platform: platforms[index],
      status: 'error' as const,
      message: result.reason instanceof Error ? result.reason.message : '未知错误',
    };
  });
}
