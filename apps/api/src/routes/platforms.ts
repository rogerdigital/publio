import { Hono } from 'hono';
import { markdownToHtml, markdownToStyledHtml } from '@/lib/markdown';
import { WechatPublisher } from '@/lib/publishers/wechat';
import { XPublisher } from '@/lib/publishers/x';
import { XiaohongshuPublisher } from '@/lib/publishers/xiaohongshu';
import { ZhihuPublisher } from '@/lib/publishers/zhihu';
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
import { createNonce, consumeNonce } from '@/lib/platformConnections/oauthNonce';
import { getXhsConfig } from '@/lib/config';
import { writeEnvKey } from '@/lib/storage/envFile';

const VALID_PLATFORMS = new Set<string>(['wechat', 'xiaohongshu', 'zhihu', 'x']);
const MANUAL_CONFIG_PLATFORMS = new Set<PlatformId>(['wechat', 'x']);

// Web app origin for OAuth post-callback redirects (SPA runs on a different port)
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:3000';
const webUrl = (path: string) => `${WEB_ORIGIN}${path}`;

type PlatformChecker = () => Promise<CheckResult>;
const CHECKERS: Record<PlatformId, PlatformChecker> = {
  wechat: checkWechat,
  xiaohongshu: checkXiaohongshu,
  zhihu: checkZhihu,
  x: checkX,
};

export const platformsRoutes = new Hono();

// ── Direct publish endpoints ───────────────────────────────────────
platformsRoutes.post('/wechat', async (c) => {
  const { title, content } = await c.req.json();
  if (!title?.trim() || !content?.trim()) return c.json({ error: '标题和内容不能为空' }, 400);
  const result = await new WechatPublisher().publish({
    title,
    markdownContent: content,
    htmlContent: markdownToStyledHtml(title, content, 'wechat'),
  });
  return c.json(result);
});

platformsRoutes.post('/x', async (c) => {
  const { title, content } = await c.req.json();
  if (!title?.trim() || !content?.trim()) return c.json({ error: '标题和内容不能为空' }, 400);
  const result = await new XPublisher().publish({
    title,
    markdownContent: content,
    htmlContent: markdownToHtml(content),
  });
  return c.json(result);
});

platformsRoutes.post('/xiaohongshu', async (c) => {
  const { title, content } = await c.req.json();
  if (!title?.trim() || !content?.trim()) return c.json({ error: '标题和内容不能为空' }, 400);
  const result = await new XiaohongshuPublisher().publish({
    title,
    markdownContent: content,
    htmlContent: markdownToHtml(content),
  });
  return c.json(result);
});

platformsRoutes.post('/zhihu', async (c) => {
  const { title, content } = await c.req.json();
  if (!title?.trim() || !content?.trim()) return c.json({ error: '标题和内容不能为空' }, 400);
  const result = await new ZhihuPublisher().publish({
    title,
    markdownContent: content,
    htmlContent: markdownToStyledHtml(title, content, 'zhihu'),
  });
  return c.json(result);
});

// ── Connection records ─────────────────────────────────────────────
platformsRoutes.get('/connection/records', (c) => {
  try {
    return c.json(getConnectionRecordStore().listRecords());
  } catch {
    return c.json([]);
  }
});

// ── Per-platform connection check ──────────────────────────────────
platformsRoutes.post('/:platform/connection/check', async (c) => {
  try {
    const platform = c.req.param('platform');
    if (!VALID_PLATFORMS.has(platform)) return c.json({ error: '不支持的平台' }, 400);

    const platformId = platform as PlatformId;
    const definition = PLATFORM_CONNECTIONS.find((d) => d.platform === platformId);
    if (!definition) return c.json({ error: '平台配置未找到' }, 400);

    const checkedAt = new Date().toISOString();
    const result = await CHECKERS[platformId]();

    const store = getConnectionRecordStore();
    store.markChecked(platformId, {
      platform: platformId,
      ok: result.ok,
      failureReason: result.failureReason,
      checkedAt,
    });

    if (result.ok) {
      store.upsertRecord(platformId, {
        ...(result.accountName ? { accountName: result.accountName } : {}),
        ...(result.expiresAt ? { expiresAt: result.expiresAt } : {}),
        lastCheckedAt: checkedAt,
        failureReason: undefined,
      });
    }

    return c.json({
      ok: result.ok,
      failureReason: result.failureReason,
      accountName: result.accountName,
      checkedAt,
      record: store.getRecord(platformId),
    });
  } catch (error) {
    return c.json(
      { ok: false, error: error instanceof Error ? error.message : '连接检查失败' },
      500,
    );
  }
});

platformsRoutes.post('/:platform/connection/disconnect', (c) => {
  try {
    const platform = c.req.param('platform');
    if (!VALID_PLATFORMS.has(platform)) return c.json({ error: '不支持的平台' }, 400);
    getConnectionRecordStore().clearRecord(platform as PlatformId);
    return c.json({ ok: true });
  } catch {
    return c.json({ error: '断开连接失败' }, 500);
  }
});

// ── OAuth start ────────────────────────────────────────────────────
platformsRoutes.post('/:platform/connection/oauth/start', async (c) => {
  try {
    const platform = c.req.param('platform');
    if (!VALID_PLATFORMS.has(platform)) return c.json({ error: '不支持的平台' }, 400);

    const platformId = platform as PlatformId;
    const definition = PLATFORM_CONNECTIONS.find((d) => d.platform === platformId);
    if (!definition) return c.json({ error: '平台配置未找到' }, 400);
    if (definition.mode !== 'oauth') {
      return c.json({ error: `${platformId} 使用手动凭证模式，不支持 OAuth 授权流程` }, 400);
    }

    if (MANUAL_CONFIG_PLATFORMS.has(platformId)) {
      return c.json(
        {
          requiresManualConfig: true,
          message:
            platformId === 'wechat'
              ? '微信公众号使用 AppID + AppSecret 直接接入，无需 OAuth 授权。请填写凭证后点击「验证连接」。'
              : '请在 developer.x.com 生成 Access Token，填写全部 4 个 key 后点击「验证连接」。',
        },
        400,
      );
    }

    if (platformId === 'xiaohongshu') {
      const { appId } = getXhsConfig();
      if (!appId) return c.json({ error: '请先填写并保存 XHS_APP_ID，再发起授权' }, 400);

      const state = createNonce('xiaohongshu');
      const callbackUrl = new URL(
        '/api/platforms/xiaohongshu/connection/oauth/callback',
        c.req.url,
      ).toString();

      const authUrl =
        `https://oauth.xiaohongshu.com/authorize` +
        `?client_id=${encodeURIComponent(appId)}` +
        `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
        `&response_type=code` +
        `&scope=note.create` +
        `&state=${encodeURIComponent(state)}`;

      return c.json({ authUrl });
    }

    return c.json({ error: '该平台暂不支持 OAuth 授权流程' }, 501);
  } catch {
    return c.json({ error: 'OAuth 授权流程异常' }, 500);
  }
});

// ── OAuth callback (redirect-based) ────────────────────────────────
platformsRoutes.get('/:platform/connection/oauth/callback', async (c) => {
  const platform = c.req.param('platform');
  if (!VALID_PLATFORMS.has(platform)) return c.redirect(webUrl('/settings?error=invalid_platform'));

  const platformId = platform as PlatformId;
  const code = c.req.query('code') ?? '';
  const state = c.req.query('state') ?? '';

  if (!code) return c.redirect(webUrl(`/settings?error=missing_code&platform=${platformId}`));

  const noncePlatform = consumeNonce(state);
  if (!noncePlatform || noncePlatform !== platformId) {
    return c.redirect(webUrl(`/settings?error=invalid_state&platform=${platformId}`));
  }

  if (platformId === 'xiaohongshu') {
    const { appId, appSecret } = getXhsConfig();
    const callbackUrl = new URL(
      '/api/platforms/xiaohongshu/connection/oauth/callback',
      c.req.url,
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
        const msg = encodeURIComponent(
          tokenData.msg || tokenData.message || 'token_exchange_failed',
        );
        return c.redirect(webUrl(`/settings?error=${msg}&platform=xiaohongshu`));
      }

      const accessToken = tokenData.data?.access_token || tokenData.access_token;
      const expiresIn = tokenData.data?.expires_in || tokenData.expires_in || 7200;
      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      await writeEnvKey('XHS_ACCESS_TOKEN', accessToken);
      getConnectionRecordStore().upsertRecord('xiaohongshu', {
        connectedAt: new Date().toISOString(),
        expiresAt,
        failureReason: undefined,
      });

      return c.redirect(webUrl('/settings?connected=xiaohongshu'));
    } catch (error) {
      const msg = encodeURIComponent(error instanceof Error ? error.message : 'unknown_error');
      return c.redirect(webUrl(`/settings?error=${msg}&platform=xiaohongshu`));
    }
  }

  return c.redirect(webUrl(`/settings?error=unsupported_platform&platform=${platformId}`));
});
