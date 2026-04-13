import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';
import { getConnectionRecordStore } from '@/lib/platformConnections/registry';
import {
  checkWechat,
  checkXiaohongshu,
  checkZhihu,
  checkX,
  type CheckResult,
} from '@/lib/platformConnections/checkers';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

type PlatformChecker = () => Promise<CheckResult>;

const CHECKERS: Record<PlatformId, PlatformChecker> = {
  wechat: checkWechat,
  xiaohongshu: checkXiaohongshu,
  zhihu: checkZhihu,
  x: checkX,
};

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: '不支持的平台' }, { status: 400 });
  }

  const platformId = platform as PlatformId;
  const definition = PLATFORM_CONNECTIONS.find((d) => d.platform === platformId);
  if (!definition) {
    return NextResponse.json({ error: '平台配置未找到' }, { status: 400 });
  }

  const checkedAt = new Date().toISOString();
  const checker = CHECKERS[platformId];
  const result = await checker();

  // 持久化检查结果（markChecked 更新 lastCheckedAt + failureReason）
  const store = getConnectionRecordStore();
  store.markChecked(platformId, {
    platform: platformId,
    ok: result.ok,
    failureReason: result.failureReason,
    checkedAt,
  });

  // 同时更新账号元数据和 token 过期时间
  if (result.ok) {
    store.upsertRecord(platformId, {
      ...(result.accountName ? { accountName: result.accountName } : {}),
      ...(result.expiresAt ? { expiresAt: result.expiresAt } : {}),
      lastCheckedAt: checkedAt,
      failureReason: undefined,
    });
  }

  const record = store.getRecord(platformId);

  return NextResponse.json({ ok: result.ok, failureReason: result.failureReason, accountName: result.accountName, checkedAt, record });
}
