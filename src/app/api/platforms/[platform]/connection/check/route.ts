import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';
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

  const platformId = platform as PlatformId;
  const definition = PLATFORM_CONNECTIONS.find((d) => d.platform === platformId);
  if (!definition) {
    return NextResponse.json({ error: '平台配置未找到' }, { status: 400 });
  }

  const checkedAt = new Date().toISOString();

  // For manual-mode platforms (e.g. zhihu), we only verify that
  // the required env keys are present — no live API call.
  const missingKeys = definition.requiredKeys.filter(
    (key) => !process.env[key]?.trim(),
  );
  const ok = missingKeys.length === 0;
  const failureReason = ok
    ? undefined
    : `缺少必要凭证: ${missingKeys.join(', ')}`;

  const record = getConnectionRecordStore().markChecked(platformId, {
    platform: platformId,
    ok,
    failureReason,
    checkedAt,
  });

  return NextResponse.json({ ok, failureReason, checkedAt, record });
}
