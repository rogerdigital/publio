import { NextResponse } from 'next/server';

import { getSyncHistoryStore } from '@/lib/sync/registry';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    syncTasks: getSyncHistoryStore().listTasks(),
  });
}
