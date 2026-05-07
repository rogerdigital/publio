import { NextRequest } from 'next/server';

import { getSyncHistoryStore } from '@/lib/sync/registry';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface SyncTaskRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function missingSyncTaskResponse() {
  return apiError('分发任务不存在', 404);
}

export async function GET(_request: NextRequest | Request, { params }: SyncTaskRouteContext) {
  const { id } = await params;
  const syncTask = getSyncHistoryStore().getTask(id);
  if (!syncTask) return missingSyncTaskResponse();
  return apiResponse({ syncTask });
}
