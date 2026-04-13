import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';
import { getConnectionRecordStore } from '@/lib/platformConnections/registry';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

/**
 * POST /api/platforms/[platform]/connection/oauth/callback
 *
 * Handles the OAuth authorization code callback.
 * Expects `{ code, state }` in the request body.
 *
 * Currently returns a 501 stub — the token exchange logic is the integration
 * point for each platform's OAuth SDK. Once implemented, this handler should:
 * 1. Validate the `state` parameter against a session-stored nonce
 * 2. Exchange `code` for access/refresh tokens via the platform API
 * 3. Store tokens in `.env.local` (or a secrets store) via the settings API
 * 4. Call `getConnectionRecordStore().upsertRecord()` with account metadata
 * 5. Redirect the user back to `/settings`
 */
export async function POST(
  request: NextRequest,
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

  if (definition.mode !== 'oauth') {
    return NextResponse.json(
      { error: `${platformId} 不支持 OAuth 回调` },
      { status: 400 },
    );
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const code = typeof body.code === 'string' ? body.code.trim() : '';

  if (!code) {
    return NextResponse.json({ error: '缺少授权码 code' }, { status: 400 });
  }

  // Token exchange not yet implemented.
  // When ready, exchange `code` for tokens here and call:
  //   getConnectionRecordStore().upsertRecord(platformId, { connectedAt, accountName, ... })
  void getConnectionRecordStore; // referenced so the import is not removed

  return NextResponse.json(
    {
      error: 'OAuth token 交换尚未实现',
      platform: platformId,
    },
    { status: 501 },
  );
}
