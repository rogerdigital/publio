import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';
import { getConnectionRecordStore } from '@/lib/platformConnections/registry';
import { consumeNonce } from '@/lib/platformConnections/oauthNonce';
import { writeEnvKey } from '@/lib/storage/envFile';
import { getXhsConfig } from '@/lib/config';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

/**
 * GET /api/platforms/[platform]/connection/oauth/callback
 *
 * OAuth 授权码回调（平台 redirect 走 GET，query string 携带 code + state）。
 * 当前支持小红书授权码换 access_token。
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  const { platform } = await params;

  if (!VALID_PLATFORMS.has(platform)) {
    return NextResponse.redirect(new URL('/settings?error=invalid_platform', request.url));
  }

  const platformId = platform as PlatformId;
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code') ?? '';
  const state = searchParams.get('state') ?? '';

  if (!code) {
    return NextResponse.redirect(new URL(`/settings?error=missing_code&platform=${platformId}`, request.url));
  }

  // 验证 state nonce（防 CSRF）
  const noncePlatform = consumeNonce(state);
  if (!noncePlatform || noncePlatform !== platformId) {
    return NextResponse.redirect(new URL(`/settings?error=invalid_state&platform=${platformId}`, request.url));
  }

  if (platformId === 'xiaohongshu') {
    const { appId, appSecret } = getXhsConfig();
    const callbackUrl = new URL(
      '/api/platforms/xiaohongshu/connection/oauth/callback',
      request.url,
    ).toString();

    try {
      const tokenRes = await fetch('https://open.xiaohongshu.com/api/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: callbackUrl,
        }),
      });
      const tokenData = await tokenRes.json();

      if (tokenData.code !== 0 && tokenData.code !== 200) {
        const msg = encodeURIComponent(tokenData.msg || tokenData.message || 'token_exchange_failed');
        return NextResponse.redirect(new URL(`/settings?error=${msg}&platform=xiaohongshu`, request.url));
      }

      const accessToken = tokenData.data?.access_token || tokenData.access_token;
      const expiresIn = tokenData.data?.expires_in || tokenData.expires_in || 7200;
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // 写入 .env.local
      await writeEnvKey('XHS_ACCESS_TOKEN', accessToken);

      // 更新连接记录
      getConnectionRecordStore().upsertRecord('xiaohongshu', {
        connectedAt: new Date().toISOString(),
        expiresAt,
        failureReason: undefined,
      });

      return NextResponse.redirect(new URL('/settings?connected=xiaohongshu', request.url));
    } catch (error) {
      const msg = encodeURIComponent(error instanceof Error ? error.message : 'unknown_error');
      return NextResponse.redirect(new URL(`/settings?error=${msg}&platform=xiaohongshu`, request.url));
    }
  }

  return NextResponse.redirect(new URL(`/settings?error=unsupported_platform&platform=${platformId}`, request.url));
}

/**
 * POST /api/platforms/[platform]/connection/oauth/callback
 *
 * 保留原有 POST stub（兼容旧客户端调用）。
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

  void getConnectionRecordStore;

  return NextResponse.json(
    { error: '请通过浏览器重定向完成 OAuth 授权，而非直接调用此接口', platform: platformId },
    { status: 400 },
  );
}
