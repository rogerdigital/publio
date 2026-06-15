import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import type { PlatformId } from '@/types';
import { logger } from '@/lib/logger';

const LOCAL_IMAGE_PATTERN = /\/api\/uploads\/([a-zA-Z0-9._-]+)/g;

const MIME_FROM_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
};

interface ImageEntry {
  localUrl: string;
  filename: string;
  buffer: Buffer;
  mimeType: string;
}

/** Read a local upload file from .publio-data/uploads/ */
async function readLocalImage(
  filename: string,
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const filepath = join(createLocalDataPath('uploads'), filename);
    const buffer = await readFile(filepath);
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const mimeType = MIME_FROM_EXT[ext] || 'image/png';
    return { buffer, mimeType };
  } catch {
    return null;
  }
}

/** Extract all local image references from content */
function extractLocalImages(content: string): { localUrl: string; filename: string }[] {
  const results: { localUrl: string; filename: string }[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;
  const re = new RegExp(LOCAL_IMAGE_PATTERN.source, 'g');
  while ((match = re.exec(content)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1]);
      results.push({ localUrl: match[0], filename: match[1] });
    }
  }
  return results;
}

// ── Platform upload functions ───────────────────────────────────────

async function uploadToWechat(
  buffer: Buffer,
  mimeType: string,
  token: string,
): Promise<string | null> {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const encoder = new TextEncoder();

  const header = encoder.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="media"; filename="image.${ext}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
  );
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);

  const body = new Uint8Array(header.length + buffer.length + footer.length);
  body.set(header, 0);
  body.set(buffer, header.length);
  body.set(footer, header.length + buffer.length);

  const res = await fetch(
    `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': `multipart/form-data; boundary=${boundary}` },
      body,
    },
  );

  const data = await res.json();
  if (data.url) return data.url as string;
  logger.warn('WeChat image upload failed', { errcode: data.errcode, errmsg: data.errmsg });
  return null;
}

async function uploadToZhihu(
  buffer: Buffer,
  mimeType: string,
  cookie: string,
): Promise<string | null> {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const encoder = new TextEncoder();

  const header = encoder.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.${ext}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
  );
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);

  const body = new Uint8Array(header.length + buffer.length + footer.length);
  body.set(header, 0);
  body.set(buffer, header.length);
  body.set(footer, header.length + buffer.length);

  const res = await fetch('https://zhuanlan.zhihu.com/api/images', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Cookie: cookie,
      'x-requested-with': 'fetch',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    body,
  });

  const data = await res.json();
  if (data.url) return data.url as string;
  logger.warn('Zhihu image upload failed', { status: res.status });
  return null;
}

async function uploadToXiaohongshu(
  buffer: Buffer,
  mimeType: string,
  accessToken: string,
): Promise<string | null> {
  const boundary = '----FormBoundary' + Math.random().toString(36).slice(2);
  const ext = mimeType === 'image/png' ? 'png' : 'jpg';
  const encoder = new TextEncoder();

  const header = encoder.encode(
    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="image.${ext}"\r\nContent-Type: ${mimeType}\r\n\r\n`,
  );
  const footer = encoder.encode(`\r\n--${boundary}--\r\n`);

  const body = new Uint8Array(header.length + buffer.length + footer.length);
  body.set(header, 0);
  body.set(buffer, header.length);
  body.set(footer, header.length + buffer.length);

  const res = await fetch('https://open.xiaohongshu.com/api/media/upload', {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  });

  const data = await res.json();
  const imageId = data.data?.image_id || data.image_id;
  if (imageId) return imageId as string;
  logger.warn('Xiaohongshu image upload failed', { code: data.code, msg: data.msg });
  return null;
}

// ── Public API ──────────────────────────────────────────────────────

export interface PlatformImageContext {
  wechatToken?: string;
  zhihuCookie?: string;
  xhsAccessToken?: string;
}

export interface ResolvedImages {
  markdownContent: string;
  htmlContent: string;
  /** For X: media IDs to attach to tweet */
  mediaIds?: string[];
  /** For Xiaohongshu: uploaded image IDs */
  xhsImageIds?: string[];
}

/**
 * Detect local images in content, upload to target platform, replace URLs.
 * Non-blocking: failures skip the image silently.
 */
export async function resolveLocalImages(
  markdownContent: string,
  htmlContent: string,
  platform: PlatformId,
  context: PlatformImageContext,
): Promise<ResolvedImages> {
  const refs = extractLocalImages(markdownContent + '\n' + htmlContent);
  if (refs.length === 0) {
    return { markdownContent, htmlContent };
  }

  // Read all local images
  const entries: ImageEntry[] = [];
  for (const ref of refs) {
    const data = await readLocalImage(ref.filename);
    if (data) {
      entries.push({ ...ref, ...data });
    }
  }

  if (entries.length === 0) {
    return { markdownContent, htmlContent };
  }

  let updatedMarkdown = markdownContent;
  let updatedHtml = htmlContent;
  const mediaIds: string[] = [];
  const xhsImageIds: string[] = [];

  for (const entry of entries) {
    let remoteUrl: string | null = null;

    switch (platform) {
      case 'wechat':
        if (context.wechatToken) {
          remoteUrl = await uploadToWechat(entry.buffer, entry.mimeType, context.wechatToken);
        }
        break;
      case 'zhihu':
        if (context.zhihuCookie) {
          remoteUrl = await uploadToZhihu(entry.buffer, entry.mimeType, context.zhihuCookie);
        }
        break;
      case 'xiaohongshu':
        if (context.xhsAccessToken) {
          const imageId = await uploadToXiaohongshu(
            entry.buffer,
            entry.mimeType,
            context.xhsAccessToken,
          );
          if (imageId) xhsImageIds.push(imageId);
        }
        break;
      case 'x':
        // X handles media separately via twitter-api-v2; collect buffers for caller
        mediaIds.push(entry.filename);
        break;
    }

    if (remoteUrl) {
      updatedMarkdown = updatedMarkdown.replaceAll(entry.localUrl, remoteUrl);
      updatedHtml = updatedHtml.replaceAll(entry.localUrl, remoteUrl);
    }
  }

  return {
    markdownContent: updatedMarkdown,
    htmlContent: updatedHtml,
    mediaIds: mediaIds.length > 0 ? mediaIds : undefined,
    xhsImageIds: xhsImageIds.length > 0 ? xhsImageIds : undefined,
  };
}

/** Read local image buffers for X media upload (called by XPublisher) */
export async function getLocalImageBuffers(
  markdownContent: string,
): Promise<{ buffer: Buffer; mimeType: string }[]> {
  const refs = extractLocalImages(markdownContent);
  const results: { buffer: Buffer; mimeType: string }[] = [];
  for (const ref of refs.slice(0, 4)) {
    const data = await readLocalImage(ref.filename);
    if (data) results.push(data);
  }
  return results;
}
