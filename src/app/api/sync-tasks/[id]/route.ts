import { NextRequest, NextResponse } from 'next/server';

import { getSyncHistoryStore } from '@/lib/sync/registry';

export const dynamic = 'force-dynamic';

interface SyncTaskRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function missingSyncTaskResponse() {
  return NextResponse.json({ error: '分发任务不存在' }, { status: 404 });
}

export async function GET(_request: NextRequest | Request, { params }: SyncTaskRouteContext) {
  const { id } = await params;
  const syncTask = getSyncHistoryStore().getTask(id);
  if (!syncTask) return missingSyncTaskResponse();
  return NextResponse.json({ syncTask });
}
