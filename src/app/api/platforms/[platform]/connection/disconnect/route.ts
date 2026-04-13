import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { getConnectionRecordStore } from '@/lib/platformConnections/registry';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: '不支持的平台' }, { status: 400 });
  }

  getConnectionRecordStore().clearRecord(platform as PlatformId);

  return NextResponse.json({ ok: true });
}
