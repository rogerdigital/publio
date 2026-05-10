import { NextRequest } from 'next/server';

import type { PlatformId } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { toDraftStatus } from '@/lib/publishers/executePublish';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface MarkDoneRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function isPlatformId(value: unknown): value is PlatformId {
  return value === 'wechat' || value === 'xiaohongshu' || value === 'zhihu' || value === 'x';
}

export async function POST(request: NextRequest | Request, { params }: MarkDoneRouteContext) {
  const { id } = await params;
  const body = await request.json();
  const platform = body.platform;

  if (!isPlatformId(platform)) {
    return apiError('平台参数无效');
  }

  const syncStore = getSyncHistoryStore();
  const currentTask = syncStore.getTask(id);
  if (!currentTask) {
    return apiError('分发任务不存在', 404);
  }

  const receipt = currentTask.receipts.find((item) => item.platform === platform);
  if (!receipt) {
    return apiError('平台回执不存在', 404);
  }
  if (receipt.status !== 'needs-action') {
    return apiError('该平台不需要手动确认');
  }

  const syncTask = syncStore.markPlatformDone(id, platform);

  if (!syncTask) {
    return apiError('更新分发任务失败', 500);
  }

  if (syncTask.draftId) {
    getDraftRegistry().updateDraft(syncTask.draftId, {
      status: toDraftStatus(syncTask.status),
    });
  }

  return apiResponse({ syncTask });
}
