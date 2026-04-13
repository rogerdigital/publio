import { NextRequest, NextResponse } from 'next/server';
import type { PlatformId } from '@/types';
import { PLATFORM_CONNECTIONS } from '@/lib/platformConnections';
import { createNonce } from '@/lib/platformConnections/oauthNonce';
import { getXhsConfig } from '@/lib/config';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);

// 微信和 X 不需要 OAuth 重定向，引导用户手动填写
const MANUAL_CONFIG_PLATFORMS = new Set<PlatformId>(['wechat', 'x']);

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

  // 微信/X：不需要 OAuth 重定向，直接引导手动配置 + 验证连接
  if (MANUAL_CONFIG_PLATFORMS.has(platformId)) {
    return NextResponse.json(
      {
        requiresManualConfig: true,
        message: platformId === 'wechat'
          ? '微信公众号使用 AppID + AppSecret 直接接入，无需 OAuth 授权。请填写凭证后点击「验证连接」。'
          : '请在 developer.x.com 生成 Access Token，填写全部 4 个 key 后点击「验证连接」。',
      },
      { status: 400 },
    );
  }

  // 小红书：生成 OAuth 授权 URL
  if (platformId === 'xiaohongshu') {
    const { appId } = getXhsConfig();
    if (!appId) {
      return NextResponse.json(
        { error: '请先填写并保存 XHS_APP_ID，再发起授权' },
        { status: 400 },
      );
    }

    const state = createNonce('xiaohongshu');
    const callbackUrl = new URL(
      '/api/platforms/xiaohongshu/connection/oauth/callback',
      request.url,
    ).toString();

    const authUrl =
      `https://oauth.xiaohongshu.com/authorize` +
      `?client_id=${encodeURIComponent(appId)}` +
      `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
      `&response_type=code` +
      `&scope=note.create` +
      `&state=${encodeURIComponent(state)}`;

    return NextResponse.json({ authUrl });
  }

  return NextResponse.json({ error: '该平台暂不支持 OAuth 授权流程' }, { status: 501 });
}
