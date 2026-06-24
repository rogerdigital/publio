import type { PlatformId } from '@/types';
import { validateForPlatform } from '@/lib/platformRules/validate';

export type PlatformReadiness =
  | 'unconfigured'
  | 'ready'
  | 'needs-content'
  | 'needs-review'
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
 *
 * @param displayTitle 校验用标题（适配后，与平台预览面板一致）
 * @param displayBody  校验用正文（适配后：优先 draft.aiBody，否则 draft.body）
 */
export function getPlatformReadiness(
  platform: PlatformId,
  displayTitle: string | undefined,
  displayBody: string | undefined,
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

  // 接入平台规则校验（与平台预览面板同一套标准、同一份适配后内容）
  const result = validateForPlatform(displayTitle ?? '', displayBody ?? '', platform);
  const error = result.issues.find((i) => i.severity === 'error');
  const warning = result.issues.find((i) => i.severity === 'warning');

  if (error) {
    return { platform, status: 'needs-content', message: error.message };
  }
  if (warning) {
    // 超限等为 warning：不阻塞发布，但提示用户注意
    const detail =
      warning.current !== undefined && warning.limit !== undefined
        ? `${warning.message}（${warning.current}/${warning.limit}）`
        : warning.message;
    return { platform, status: 'needs-review', message: detail };
  }

  // 就绪
  return { platform, status: 'ready', message: '可发布' };
}
