import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

/**
 * POST /api/platforms/[platform]/connection/oauth/start
 *
 * Returns the authorization URL for the platform's OAuth flow.
 * The client should redirect the user to this URL.
 *
 * Currently returns a 501 for all platforms as real OAuth integrations
 * require platform-specific developer app credentials and callback URIs.
 * This endpoint is the designated integration point for future OAuth support.
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
      { error: `${platformId} 使用手动凭证模式，不支持 OAuth 授权流程` },
      { status: 400 },
    );
  }

  // OAuth flows require platform-specific client credentials and a registered
  // callback URI. These are not yet configured — return a clear 501 with
  // guidance for future implementation.
  return NextResponse.json(
    {
      error: 'OAuth 授权流程尚未实现，请在设置页面手动填写 API 凭证',
      platform: platformId,
      mode: definition.mode,
    },
    { status: 501 },
  );
}
