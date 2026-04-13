import { NextResponse } from 'next/server';
import { getConnectionRecordStore } from '@/lib/platformConnections/registry';

/**
 * GET /api/platforms/connection/records
 *
 * 返回所有平台的连接记录（accountName、lastCheckedAt、failureReason、expiresAt 等）。
 * 用于设置页面加载时展示真实连接状态。
 */
export async function GET() {
  const records = getConnectionRecordStore().listRecords();
  return NextResponse.json(records);
}
