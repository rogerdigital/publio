import { apiError, apiResponse } from '@/lib/api/response';
import { refreshMetricsForTask } from '@/lib/metrics/refresh';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { syncTaskId } = body;

    if (!syncTaskId) {
      return apiError('syncTaskId is required');
    }

    const metrics = await refreshMetricsForTask(syncTaskId);
    if (!metrics) {
      return apiError('No metrics could be fetched for this task', 404);
    }

    return apiResponse({ metrics });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : 'Failed to refresh metrics', 500);
  }
}
