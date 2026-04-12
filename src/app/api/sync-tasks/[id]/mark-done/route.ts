import { NextRequest, NextResponse } from 'next/server';

import type { PlatformId } from '@/types';
import { getDraftRegistry } from '@/lib/drafts/registry';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import { toDraftStatus } from '@/lib/publishers/executePublish';

export const dynamic = 'force-dynamic';

interface MarkDoneRouteContext {
  params: Promise<{
    id: string;
  }>;
}

function isPlatformId(value: unknown): value is PlatformId {
  return (
    value === 'wechat' ||
    value === 'xiaohongshu' ||
    value === 'zhihu' ||
    value === 'x'
  );
}

export async function POST(request: NextRequest | Request, { params }: MarkDoneRouteContext) {
  const { id } = await params;
  const body = await request.json();
  const platform = body.platform;

  if (!isPlatformId(platform)) {
    return NextResponse.json({ error: '平台参数无效' }, { status: 400 });
  }

  const syncStore = getSyncHistoryStore();
  const currentTask = syncStore.getTask(id);
  if (!currentTask) {
    return NextResponse.json({ error: '分发任务不存在' }, { status: 404 });
  }

  const receipt = currentTask.receipts.find((item) => item.platform === platform);
  if (!receipt) {
    return NextResponse.json({ error: '平台回执不存在' }, { status: 404 });
  }
  if (receipt.status !== 'needs-action') {
    return NextResponse.json({ error: '该平台不需要手动确认' }, { status: 400 });
  }

  const syncTask = syncStore.updateReceipt(id, platform, {
    status: 'published',
    message: '已手动确认完成',
  });

  if (!syncTask) {
    return NextResponse.json({ error: '更新分发任务失败' }, { status: 500 });
  }

  if (syncTask.draftId) {
    getDraftRegistry().updateDraft(syncTask.draftId, {
      status: toDraftStatus(syncTask.status),
    });
  }

  return NextResponse.json({ syncTask });
}
