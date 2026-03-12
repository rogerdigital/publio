import { Publisher, PublishInput, PublishOutput } from './types';
import { getZhihuConfig } from '@/lib/config';

export class ZhihuPublisher implements Publisher {
  platform = 'zhihu' as const;

  validateConfig(): boolean {
    const { cookie } = getZhihuConfig();
    return !!cookie;
  }

  async publish(input: PublishInput): Promise<PublishOutput> {
    try {
      if (!this.validateConfig()) {
        return {
          success: false,
          platform: 'zhihu',
          message: '知乎凭证未配置，请在设置中配置 Cookie',
        };
      }

      const { cookie } = getZhihuConfig();
      const headers = {
        Cookie: cookie,
        'Content-Type': 'application/json',
        'x-requested-with': 'fetch',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };

      // Step 1: Create draft
      const draftRes = await fetch(
        'https://zhuanlan.zhihu.com/api/articles/drafts',
        {
          method: 'POST',
          headers,
          body: JSON.stringify({}),
        }
      );

      if (draftRes.status === 401) {
        throw new Error('知乎 Cookie 已过期，请在设置中更新 Cookie');
      }

      if (draftRes.status === 429) {
        // Rate limited, wait and retry once
        await new Promise((r) => setTimeout(r, 3000));
        const retryRes = await fetch(
          'https://zhuanlan.zhihu.com/api/articles/drafts',
          { method: 'POST', headers, body: JSON.stringify({}) }
        );
        if (!retryRes.ok) {
          throw new Error('知乎请求频率过高，请稍后再试');
        }
        const retryData = await retryRes.json();
        return this.continuePublish(retryData.id, input, headers);
      }

      if (!draftRes.ok) {
        throw new Error(`知乎创建草稿失败 (${draftRes.status})`);
      }

      const draftData = await draftRes.json();
      return this.continuePublish(draftData.id, input, headers);
    } catch (error) {
      return {
        success: false,
        platform: 'zhihu',
        message: error instanceof Error ? error.message : '知乎发布失败',
      };
    }
  }

  private async continuePublish(
    draftId: string,
    input: PublishInput,
    headers: Record<string, string>
  ): Promise<PublishOutput> {
    // Step 2: Update draft content
    const updateRes = await fetch(
      `https://zhuanlan.zhihu.com/api/articles/${draftId}/draft`,
      {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          title: input.title,
          content: input.htmlContent,
          topic_url_tokens: [],
          column_url_token: '',
        }),
      }
    );

    if (!updateRes.ok) {
      throw new Error(`知乎更新草稿内容失败 (${updateRes.status})`);
    }

    // Step 3: Publish draft
    const publishRes = await fetch(
      `https://zhuanlan.zhihu.com/api/articles/${draftId}/publish`,
      {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          column: null,
          commentPermission: 'anyone',
        }),
      }
    );

    if (!publishRes.ok) {
      throw new Error(`知乎发布文章失败 (${publishRes.status})`);
    }

    return {
      success: true,
      platform: 'zhihu',
      message: '发布成功',
      url: `https://zhuanlan.zhihu.com/p/${draftId}`,
    };
  }
}
