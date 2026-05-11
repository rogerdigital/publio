import { NextRequest } from 'next/server';
import { getMetricsStore } from '@/lib/metrics/store';
import { apiResponse, apiError } from '@/lib/api/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const syncTaskId = searchParams.get('syncTaskId');

    const store = getMetricsStore();

    if (syncTaskId) {
      const metrics = store.getByTaskId(syncTaskId);
      if (!metrics) return apiError('未找到该任务的指标数据', 404);
      return apiResponse({ metrics });
    }

    const all = store.getAll();
    const summary = store.getSummary();
    const byPlatform = store.aggregateByPlatform();
    const byTopic = store.aggregateByTopic();
    return apiResponse({ metrics: all, summary, byPlatform, byTopic });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { syncTaskId, draftId, title, publishedAt, platforms } = body;

    if (!syncTaskId || !title || !platforms) {
      return apiError('缺少必要参数', 400);
    }

    const store = getMetricsStore();
    const metrics = store.upsert({
      syncTaskId,
      draftId,
      title,
      publishedAt: publishedAt ?? new Date().toISOString(),
      platforms,
    });

    return apiResponse({ metrics });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '服务器内部错误', 500);
  }
}
