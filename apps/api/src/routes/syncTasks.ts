import { Hono } from 'hono';
import type { PlatformId } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { runPublishJob } from '@/lib/publishers/publishJobRunner';
import { toDraftStatus } from '@/lib/publishers/executePublish';
import { apiResponse, apiError } from '@/lib/response';

function isPlatformId(value: unknown): value is PlatformId {
  return value === 'wechat' || value === 'xiaohongshu' || value === 'zhihu' || value === 'x';
}

export const syncTasksRoutes = new Hono();

syncTasksRoutes.get('/', (c) => {
  try {
    return apiResponse(c, { syncTasks: getSyncHistoryStore().listTasks() });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '获取分发记录失败', 500);
  }
});

syncTasksRoutes.get('/:id', (c) => {
  const syncTask = getSyncHistoryStore().getTask(c.req.param('id'));
  if (!syncTask) return apiError(c, '分发任务不存在', 404);
  return apiResponse(c, { syncTask });
});

syncTasksRoutes.post('/:id/mark-done', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();
  const platform = body.platform;

  if (!isPlatformId(platform)) return apiError(c, '平台参数无效');

  const syncStore = getSyncHistoryStore();
  const currentTask = syncStore.getTask(id);
  if (!currentTask) return apiError(c, '分发任务不存在', 404);

  const receipt = currentTask.receipts.find((item) => item.platform === platform);
  if (!receipt) return apiError(c, '平台回执不存在', 404);
  if (receipt.status !== 'needs-action') return apiError(c, '该平台不需要手动确认');

  const syncTask = syncStore.markPlatformDone(id, platform);
  if (!syncTask) return apiError(c, '更新分发任务失败', 500);

  if (syncTask.draftId) {
    getDraftRegistry().updateDraft(syncTask.draftId, {
      status: toDraftStatus(syncTask.status),
    });
  }

  return apiResponse(c, { syncTask });
});

syncTasksRoutes.post('/:id/retry', async (c) => {
  const id = c.req.param('id');
  const syncStore = getSyncHistoryStore();
  const syncTask = syncStore.getTask(id);

  if (!syncTask) return apiError(c, '分发任务不存在', 404);
  if (!syncTask.draftId) return apiError(c, '分发任务没有关联稿件，无法重试');

  const draft = getDraftRegistry().getDraft(syncTask.draftId);
  if (!draft) return apiError(c, '关联稿件不存在，无法重试', 404);

  const retryPlatforms = syncTask.receipts
    .filter((receipt) => receipt.status === 'failed')
    .filter((receipt) => receipt.failureCode !== 'auth-expired')
    .map((receipt) => receipt.platform);

  if (retryPlatforms.length === 0) {
    return apiError(c, '没有可重试的平台（需要重新授权的平台请先前往设置页重新连接）');
  }

  syncStore.appendRetryEvent(syncTask.id);
  const { syncTask: updatedTask, results } = await runPublishJob({
    syncTaskId: syncTask.id,
    title: draft.title,
    content: draft.content,
    platforms: retryPlatforms,
  });

  return apiResponse(c, { syncTask: updatedTask, retriedPlatforms: retryPlatforms, results });
});
