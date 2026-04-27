import type { PublishInput, PublishOutput } from './types';
import { BasePublisher } from './base';
import { getXhsConfig } from '@/lib/config';
import { markdownToPlainText } from '@/lib/markdown';

export class XiaohongshuPublisher extends BasePublisher {
  platform = 'xiaohongshu' as const;

  validateConfig(): boolean {
    const { appId, appSecret } = getXhsConfig();
    return !!(appId && appSecret);
  }

  protected async publishToPlatform(input: PublishInput): Promise<PublishOutput> {
    const { appId, appSecret } = getXhsConfig();
    const accessToken = await this.getAccessToken(appId, appSecret);

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
  }

  private async getAccessToken(appId: string, appSecret: string): Promise<string> {
    const { accessToken } = getXhsConfig();
    if (accessToken) return accessToken;

    const cached = this.getCachedToken('xiaohongshu');
    if (cached) return cached;

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

    this.setCachedToken('xiaohongshu', token, expiresIn);
    return token;
  }
}
