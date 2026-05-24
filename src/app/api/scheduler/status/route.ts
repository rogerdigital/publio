import { NextResponse } from 'next/server';
import { getSchedulerStatus } from '@/lib/scheduler';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(getSchedulerStatus());
  } catch {
    return NextResponse.json({ error: '获取调度器状态失败' }, { status: 500 });
  }
}
