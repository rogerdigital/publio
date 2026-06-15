import type { PlatformId } from '@/types';
import type { PlatformContentDraft } from '@/lib/platformAdapters/types';

export type PlatformReadiness =
  | 'unconfigured'
  | 'ready'
  | 'needs-content'
  | 'needs-adapt'
  | 'publishing'
  | 'success'
  | 'failed';

export interface PlatformReadinessInfo {
  platform: PlatformId;
  status: PlatformReadiness;
  message: string;
}

/**
 * 判断单个平台的发布就绪状态
 */
export function getPlatformReadiness(
  platform: PlatformId,
  draft: PlatformContentDraft | undefined,
  overallStatus: string,
  publishResult?: { status: string; message?: string },
): PlatformReadinessInfo {
  // 发布中
  if (overallStatus === 'publishing') {
    return { platform, status: 'publishing', message: '发布中...' };
  }

  // 有发布结果
  if (publishResult) {
    if (publishResult.status === 'success') {
      return { platform, status: 'success', message: '发布成功' };
    }
    if (publishResult.status === 'error') {
      return { platform, status: 'failed', message: publishResult.message || '发布失败' };
    }
  }

  // 内容不完整
  if (!draft?.title?.trim() || !draft?.body?.trim()) {
    return { platform, status: 'needs-content', message: '标题或内容为空' };
  }

  // 就绪
  return { platform, status: 'ready', message: '可发布' };
}
