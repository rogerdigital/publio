import { NextRequest } from 'next/server';
import { PlatformId } from '@/types';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import type { PlatformPublishDrafts } from '@/lib/publishers/executePublish';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import { validateTitle, validateContent, validatePlatforms } from '@/lib/validation';
import { checkContent } from '@/lib/moderation/check';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import { apiResponse, apiError } from '@/lib/api/response';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { draftId, title, content, platforms, variantIds } = body;
    let platformDrafts: PlatformPublishDrafts =
      body.platformDrafts && typeof body.platformDrafts === 'object' ? body.platformDrafts : {};

    const titleErr = validateTitle(title);
    if (titleErr) return apiError(titleErr);
    const contentErr = validateContent(content);
    if (contentErr) return apiError(contentErr);
    const platformErr = validatePlatforms(platforms);
    if (platformErr) return apiError(platformErr);

    // Resolve platform content from PlatformVariants if variantIds provided
    const resolvedVariantIds: Record<string, string> = {};
    if (variantIds && typeof variantIds === 'object') {
      const variantRegistry = getPlatformVariantRegistry();
      for (const platform of platforms as PlatformId[]) {
        const vid = variantIds[platform];
        if (vid) {
          const variant = variantRegistry.getVariant(vid);
          if (variant) {
            platformDrafts[platform] = { title: variant.title, content: variant.content };
            resolvedVariantIds[platform] = vid;
          }
        }
      }
    }

    // Content moderation check (non-blocking, returns warnings)
    const moderation = checkContent(`${title}\n${content}`);
    const forcePublish = body.forcePublish === true;
    if (!moderation.passed && !forcePublish) {
      return apiResponse({
        moderationWarning: true,
        matches: moderation.matches,
        message: `检测到 ${moderation.matches.length} 个敏感词，请确认后重试（设置 forcePublish: true 跳过检查）`,
      });
    }

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
      return apiError(`以下平台内容不完整，无法发布: ${notReadyPlatforms.join(', ')}`, 400, {
        notReadyPlatforms,
      });
    }
    void adaptations;

    const syncStore = getSyncHistoryStore();
    let syncTask = syncStore.createTask({
      draftId: typeof draftId === 'string' && draftId.trim() ? draftId.trim() : undefined,
      title,
      platforms: platforms as PlatformId[],
    });

    logger.info('Publish task created', { taskId: syncTask.id, platforms });

    void (async () => {
      const result = await runPublishJob({
        syncTaskId: syncTask.id,
        title,
        content,
        platforms: platforms as PlatformId[],
        platformDrafts,
        variantIds: resolvedVariantIds,
      });
      syncTask = result.syncTask;
      logger.info('Publish completed', {
        taskId: syncTask.id,
        durationMs: Date.now() - startTime,
      });
    })();

    return apiResponse({ syncTaskId: syncTask.id, syncTask });
  } catch (error) {
    logger.error('Publish request failed', {
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}
