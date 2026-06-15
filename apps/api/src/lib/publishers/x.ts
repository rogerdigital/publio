import { TwitterApi, EUploadMimeType, type SendTweetV2Params } from 'twitter-api-v2';
import type { PublishInput, PublishOutput } from './types';
import { BasePublisher } from './base';
import { getXConfig } from '@/lib/config';
import { markdownToPlainText } from '@/lib/markdown';
import { getLocalImageBuffers } from '@/lib/publishers/imageUpload';

function splitIntoThread(title: string, content: string): string[] {
  const plainText = markdownToPlainText(content);
  const fullText = `${title}\n\n${plainText}`;

  if (fullText.length <= 280) {
    return [fullText];
  }

  const chunks: string[] = [];
  const paragraphs = fullText.split(/\n\n+/);

  let current = '';
  for (const para of paragraphs) {
    if (para.length > 270) {
      if (current.trim()) {
        chunks.push(current.trim());
        current = '';
      }
      const sentences = para.match(/[^。！？.!?]+[。！？.!?]?/g) || [para];
      for (const sentence of sentences) {
        if ((current + ' ' + sentence).trim().length > 270) {
          if (current.trim()) chunks.push(current.trim());
          current = sentence;
        } else {
          current = current ? current + ' ' + sentence : sentence;
        }
      }
    } else if ((current + '\n\n' + para).trim().length > 270) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current = current ? current + '\n\n' + para : para;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  if (chunks.length > 1) {
    return chunks.map((chunk, i) => `${chunk}\n\n[${i + 1}/${chunks.length}]`);
  }

  return chunks;
}

export class XPublisher extends BasePublisher {
  platform = 'x' as const;

  validateConfig(): boolean {
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = getXConfig();
    return !!(apiKey && apiSecret && accessToken && accessTokenSecret);
  }

  protected async publishToPlatform(input: PublishInput): Promise<PublishOutput> {
    const { apiKey, apiSecret, accessToken, accessTokenSecret } = getXConfig();

    const client = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    // Upload local images as media (max 4)
    const mediaIds: string[] = [];
    const localImages = await getLocalImageBuffers(input.markdownContent);
    for (const img of localImages.slice(0, 4)) {
      try {
        const mimeMap: Record<string, EUploadMimeType> = {
          'image/jpeg': EUploadMimeType.Jpeg,
          'image/png': EUploadMimeType.Png,
          'image/gif': EUploadMimeType.Gif,
          'image/webp': EUploadMimeType.Webp,
        };
        const mediaId = await client.v1.uploadMedia(img.buffer, {
          mimeType: mimeMap[img.mimeType] || EUploadMimeType.Png,
        });
        mediaIds.push(mediaId);
      } catch {
        /* skip failed uploads */
      }
    }

    const chunks = splitIntoThread(input.title, input.markdownContent);

    let firstTweetId: string | undefined;
    let previousTweetId: string | undefined;

    for (let i = 0; i < chunks.length; i++) {
      const payload: SendTweetV2Params = { text: chunks[i] };

      if (previousTweetId) {
        payload.reply = { in_reply_to_tweet_id: previousTweetId };
      }

      // Attach media to first tweet only
      if (i === 0 && mediaIds.length > 0) {
        const ids = mediaIds.slice(0, 4);
        payload.media = {
          media_ids: ids as unknown as [string],
        };
      }

      const result = await client.v2.tweet(payload);
      if (!firstTweetId) firstTweetId = result.data.id;
      previousTweetId = result.data.id;
    }

    return {
      success: true,
      platform: 'x',
      message: chunks.length > 1 ? `发布成功（${chunks.length} 条推文串）` : '发布成功',
      url: `https://x.com/i/status/${firstTweetId}`,
    };
  }
}
