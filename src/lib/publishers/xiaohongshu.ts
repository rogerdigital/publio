import { Publisher, PublishInput, PublishOutput } from './types';
import { getXhsConfig } from '@/lib/config';
import { markdownToPlainText } from '@/lib/markdown';

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
      let { accessToken } = getXhsConfig();

      // Step 1: Get or refresh access token
      if (!accessToken) {
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
        accessToken = tokenData.data?.access_token || tokenData.access_token;
      }

      // Step 2: Convert content to plain text (Xiaohongshu doesn't support rich text)
      const plainText = markdownToPlainText(input.markdownContent);
      const truncatedContent =
        plainText.length > 1000
          ? plainText.slice(0, 997) + '...'
          : plainText;

      // Step 3: Create note
      const noteRes = await fetch(
        'https://open.xiaohongshu.com/api/note/publish',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: input.title.slice(0, 20), // Xiaohongshu title limit
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
