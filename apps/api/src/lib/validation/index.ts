import type { PlatformId } from '@/types';

export const MAX_CONTENT_LENGTH = 100 * 1024; // 100KB
export const MAX_TITLE_LENGTH = 200;

const VALID_PLATFORMS: PlatformId[] = ['wechat', 'xiaohongshu', 'zhihu', 'x'];

export function validateTitle(title: unknown): string | null {
  if (typeof title !== 'string' || !title.trim()) return '标题不能为空';
  if (title.length > MAX_TITLE_LENGTH) return `标题不能超过 ${MAX_TITLE_LENGTH} 个字符`;
  return null;
}

export function validateContent(content: unknown): string | null {
  if (typeof content !== 'string' || !content.trim()) return '内容不能为空';
  if (Buffer.byteLength(content, 'utf-8') > MAX_CONTENT_LENGTH) return '内容不能超过 100KB';
  return null;
}

export function validatePlatforms(platforms: unknown): string | null {
  if (!Array.isArray(platforms) || platforms.length === 0) return '请至少选择一个发布平台';
  for (const p of platforms) {
    if (!VALID_PLATFORMS.includes(p)) return `不支持的平台: ${p}`;
  }
  return null;
}
