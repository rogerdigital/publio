import { apiResponse } from '@/lib/api/response';

import { getSyncHistoryStore } from '@/lib/sync/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  return apiResponse({
    syncTasks: getSyncHistoryStore().listTasks(),
  });
}
