import { NextRequest } from 'next/server';
import { getFeedbackStore } from '@/lib/feedback/store';
import { apiResponse, apiError } from '@/lib/api/response';
import type { PlatformId } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_PLATFORMS: PlatformId[] = ['wechat', 'xiaohongshu', 'zhihu', 'x'];

export async function GET(request: NextRequest | Request) {
  const url = new URL(request.url);
  const draftId = url.searchParams.get('draftId') ?? undefined;
  const topicId = url.searchParams.get('topicId') ?? undefined;
  const platform = url.searchParams.get('platform') ?? undefined;

  if (platform && !VALID_PLATFORMS.includes(platform as PlatformId)) {
    return apiError('无效的 platform 参数', 400);
  }

  const store = getFeedbackStore();
  const feedback = store.listFeedback({
    draftId,
    topicId,
    platform: platform as PlatformId | undefined,
  });

  return apiResponse({ feedback });
}

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();

    const draftId = typeof body.draftId === 'string' ? body.draftId.trim() : '';
    if (!draftId) {
      return apiError('draftId 不能为空', 400);
    }

    const platform = body.platform;
    if (!platform || !VALID_PLATFORMS.includes(platform)) {
      return apiError('无效的 platform', 400);
    }

    const summary = typeof body.summary === 'string' ? body.summary.trim() : '';
    if (!summary) {
      return apiError('summary 不能为空', 400);
    }

    const store = getFeedbackStore();
    const feedback = store.createFeedback({
      draftId,
      variantId: typeof body.variantId === 'string' ? body.variantId : undefined,
      topicId: typeof body.topicId === 'string' ? body.topicId : undefined,
      platform: platform as PlatformId,
      metricSnapshotId:
        typeof body.metricSnapshotId === 'string' ? body.metricSnapshotId : undefined,
      summary,
      learnings: Array.isArray(body.learnings) ? body.learnings : undefined,
      nextActions: Array.isArray(body.nextActions) ? body.nextActions : undefined,
      source: body.source === 'agent' ? 'agent' : 'manual',
    });

    return apiResponse({ feedback }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建复盘失败', 500);
  }
}
