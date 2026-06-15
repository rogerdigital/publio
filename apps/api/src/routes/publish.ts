import { Hono } from 'hono';
import type { PlatformId } from '@/types';
import { PLATFORMS } from '@/types';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import type { PlatformPublishDrafts } from '@/lib/publishers/executePublish';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';
import { validateTitle, validateContent, validatePlatforms } from '@/lib/validation';
import { checkContent } from '@/lib/moderation/check';
import { getPlatformVariantRegistry } from '@/lib/platformVariants/registry';
import { runPublishChecks } from '@/lib/publishChecks/runChecks';
import { getPlatformConnectionProfiles } from '@/lib/platformConnections/profiles';
import { readEnvFile } from '@/lib/storage/envFile';
import { apiResponse, apiError } from '@/lib/response';
import { logger } from '@/lib/logger';

const VALID_PLATFORMS = PLATFORMS.map((p) => p.id);

export const publishRoutes = new Hono();

publishRoutes.post('/', async (c) => {
  const startTime = Date.now();
  try {
    const body = await c.req.json();
    const { draftId, title, content, platforms, variantIds } = body;
    let platformDrafts: PlatformPublishDrafts =
      body.platformDrafts && typeof body.platformDrafts === 'object' ? body.platformDrafts : {};

    const titleErr = validateTitle(title);
    if (titleErr) return apiError(c, titleErr);
    const contentErr = validateContent(content);
    if (contentErr) return apiError(c, contentErr);
    const platformErr = validatePlatforms(platforms);
    if (platformErr) return apiError(c, platformErr);

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

    const moderation = checkContent(`${title}\n${content}`);
    const forcePublish = body.forcePublish === true;
    if (!moderation.passed && !forcePublish) {
      return apiResponse(c, {
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
      return apiError(c, `以下平台内容不完整，无法发布: ${notReadyPlatforms.join(', ')}`, 400, {
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

    syncStore.appendTaskEvent(syncTask.id, {
      type: 'checked',
      message: forcePublish ? '内容审核通过（强制）' : '内容审核通过',
    });

    logger.info('Publish task created', { taskId: syncTask.id, platforms });

    void (async () => {
      try {
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
      } catch (error) {
        const message = error instanceof Error ? error.message : '发布任务异常';
        logger.error('Publish job failed', {
          taskId: syncTask.id,
          durationMs: Date.now() - startTime,
          error: message,
        });
        try {
          syncStore.appendTaskEvent(syncTask.id, {
            type: 'started',
            message: `[异常终止] ${message}`,
          });
        } catch {
          logger.error('Failed to log publish error event', { taskId: syncTask.id });
        }
      }
    })();

    return apiResponse(c, { syncTaskId: syncTask.id, syncTask });
  } catch (error) {
    logger.error('Publish request failed', {
      durationMs: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError(c, error instanceof Error ? error.message : '服务器内部错误', 500);
  }
});

publishRoutes.post('/check', async (c) => {
  try {
    const body = await c.req.json();
    const { title, content, draftId, variantIds } = body;

    if (typeof title !== 'string' || typeof content !== 'string') {
      return apiError(c, 'title 和 content 必须为字符串', 400);
    }

    const platforms: PlatformId[] = Array.isArray(body.platforms)
      ? body.platforms.filter(
          (p: unknown) => typeof p === 'string' && VALID_PLATFORMS.includes(p as PlatformId),
        )
      : [];

    if (platforms.length === 0) {
      return apiError(c, '至少选择一个发布平台', 400);
    }

    let connectionProfiles;
    try {
      const envValues = await readEnvFile();
      connectionProfiles = getPlatformConnectionProfiles(envValues);
    } catch {
      // skip connection checks
    }

    const summary = runPublishChecks({
      title,
      content,
      platforms,
      draftId: typeof draftId === 'string' ? draftId : undefined,
      variantIds: variantIds && typeof variantIds === 'object' ? variantIds : undefined,
      connectionProfiles,
    });

    return apiResponse(c, summary);
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '检查失败', 500);
  }
});
