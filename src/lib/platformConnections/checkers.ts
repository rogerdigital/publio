/**
 * 各平台连接状态的真实 API 探针。
 * 每个 checker 做一次实际 API 调用来验证凭证有效性。
 */
import { TwitterApi } from 'twitter-api-v2';
import { getWechatConfig, getXhsConfig, getZhihuConfig, getXConfig } from '@/lib/config';

export interface CheckResult {
  ok: boolean;
  failureReason?: string;
  accountName?: string;
  expiresAt?: string;
}

export async function checkWechat(): Promise<CheckResult> {
  const { appId, appSecret } = getWechatConfig();
  if (!appId || !appSecret) {
    return { ok: false, failureReason: '缺少 WECHAT_APP_ID 或 WECHAT_APP_SECRET' };
  }

  try {
    const res = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`
    );
    const data = await res.json();

    if (data.errcode) {
      return { ok: false, failureReason: `微信凭证无效: ${data.errmsg} (${data.errcode})` };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, failureReason: `网络请求失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

export async function checkXiaohongshu(): Promise<CheckResult> {
  const { appId, appSecret } = getXhsConfig();
  if (!appId || !appSecret) {
    return { ok: false, failureReason: '缺少 XHS_APP_ID 或 XHS_APP_SECRET' };
  }

  try {
    const tokenRes = await fetch(
      'https://open.xiaohongshu.com/api/oauth/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: appId,
          app_secret: appSecret,
          grant_type: 'client_credentials',
        }),
      }
    );
    const tokenData = await tokenRes.json();
    if (tokenData.code !== 0 && tokenData.code !== 200) {
      return { ok: false, failureReason: `小红书凭证无效: ${tokenData.msg || tokenData.message || '未知错误'}` };
    }
    const expiresAt = new Date(Date.now() + 7200 * 1000).toISOString();
    return { ok: true, expiresAt };
  } catch (error) {
    return { ok: false, failureReason: error instanceof Error ? error.message : '获取 access_token 失败' };
  }
}

export async function checkZhihu(): Promise<CheckResult> {
  const { cookie } = getZhihuConfig();
  if (!cookie) {
    return { ok: false, failureReason: '缺少 ZHIHU_COOKIE' };
  }

  try {
    const res = await fetch('https://www.zhihu.com/api/v4/me', {
      headers: {
        Cookie: cookie,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    if (res.status === 401 || res.status === 403) {
      return { ok: false, failureReason: 'Cookie 已过期或无效，请重新从浏览器复制' };
    }

    if (!res.ok) {
      return { ok: false, failureReason: `知乎接口返回 ${res.status}` };
    }

    const data = await res.json();
    return { ok: true, accountName: data.name || data.id };
  } catch (error) {
    return { ok: false, failureReason: `网络请求失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

export async function checkX(): Promise<CheckResult> {
  const { apiKey, apiSecret, accessToken, accessTokenSecret } = getXConfig();
  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret) {
    return { ok: false, failureReason: '缺少 X API 凭证，请填写全部 4 个 key' };
  }

  try {
    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret: accessTokenSecret,
    });
    const { data } = await client.v2.me();
    return { ok: true, accountName: `@${data.username}` };
  } catch (error) {
    return { ok: false, failureReason: `X API 凭证无效: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}
