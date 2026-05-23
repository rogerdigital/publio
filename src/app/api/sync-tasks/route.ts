import { apiResponse, apiError } from '@/lib/api/response';

import { getSyncHistoryStore } from '@/lib/sync/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return apiResponse({
      syncTasks: getSyncHistoryStore().listTasks(),
    });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '获取分发记录失败', 500);
  }
}
