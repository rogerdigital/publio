import { Publisher, PublishInput, PublishOutput } from './types';
import { getXhsConfig } from '@/lib/config';
import { markdownToPlainText } from '@/lib/markdown';

// 模块级 token 缓存（参照 wechat.ts 的 cachedToken 模式）
let cachedXhsToken: { token: string; expiresAt: number } | null = null;

export async function getXhsAccessToken(appId: string, appSecret: string): Promise<string> {
  // 优先使用手动配置的 access token
  const { accessToken } = getXhsConfig();
  if (accessToken) return accessToken;

  // 检查内存缓存是否有效
  if (cachedXhsToken && Date.now() < cachedXhsToken.expiresAt) {
    return cachedXhsToken.token;
  }

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
    throw new Error(
      `小红书获取 access_token 失败: ${tokenData.msg || tokenData.message || '未知错误'}`
    );
  }

  const token = tokenData.data?.access_token || tokenData.access_token;
  const expiresIn = tokenData.data?.expires_in || tokenData.expires_in || 7200;

  cachedXhsToken = {
    token,
    expiresAt: Date.now() + (expiresIn - 300) * 1000,
  };

  return token;
}

export class XiaohongshuPublisher implements Publisher {
  platform = 'xiaohongshu' as const;

  validateConfig(): boolean {
    const { appId, appSecret } = getXhsConfig();
    return !!(appId && appSecret);
  }

  async publish(input: PublishInput): Promise<PublishOutput> {
    try {
      if (!this.validateConfig()) {
        return {
          success: false,
          platform: 'xiaohongshu',
          message: '小红书凭证未配置，请在设置中配置 App ID 和 App Secret',
        };
      }

      const { appId, appSecret } = getXhsConfig();
      const accessToken = await getXhsAccessToken(appId, appSecret);

      // 转换为纯文本（小红书不支持富文本）
      const plainText = markdownToPlainText(input.markdownContent);
      const truncatedContent =
        plainText.length > 1000
          ? plainText.slice(0, 997) + '...'
          : plainText;

      const noteRes = await fetch(
        'https://open.xiaohongshu.com/api/note/publish',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title.slice(0, 20),
            content: truncatedContent,
            note_type: 'normal',
            image_ids: [],
          }),
        }
      );

      const noteData = await noteRes.json();

      if (noteData.code !== 0 && noteData.code !== 200) {
        throw new Error(
          `小红书发布失败: ${noteData.msg || noteData.message || '未知错误'}`
        );
      }

      return {
        success: true,
        platform: 'xiaohongshu',
        message: '发布成功',
        url: noteData.data?.note_url || 'https://www.xiaohongshu.com',
      };
    } catch (error) {
      return {
        success: false,
        platform: 'xiaohongshu',
        message:
          error instanceof Error
            ? error.message
            : '小红书发布失败',
      };
    }
  }
}
