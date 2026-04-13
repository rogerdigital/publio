import type { PlatformId } from '@/types';
import type {
  AdaptContentInput,
  PlatformContentDraft,
  PlatformContentDrafts,
  PlatformContentFormat,
} from '@/lib/platformAdapters/types';

const PLATFORM_FORMATS: Record<PlatformId, PlatformContentFormat> = {
  wechat: 'article',
  xiaohongshu: 'note',
  zhihu: 'article',
  x: 'thread',
};

const DEFAULT_TAGS = ['AI', '科技', '内容分发'];
const X_PART_LIMIT = 260;

// Platform-specific validation limits
const WECHAT_TITLE_MAX = 64;
const XHS_TITLE_MAX = 20;
const XHS_BODY_MAX = 1000;
const ZHIHU_TITLE_MAX = 100;

function splitForThread(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const parts: string[] = [];
  let remaining = normalized;
  while (remaining.length > X_PART_LIMIT) {
    const slice = remaining.slice(0, X_PART_LIMIT);
    const splitIndex = Math.max(slice.lastIndexOf('。'), slice.lastIndexOf(' '));
    const endIndex = splitIndex > 80 ? splitIndex + 1 : X_PART_LIMIT;
    parts.push(remaining.slice(0, endIndex).trim());
    remaining = remaining.slice(endIndex).trim();
  }
  if (remaining) {
    parts.push(remaining);
  }
  return parts;
}

function createWarnings(platform: PlatformId, title: string, body: string, threadParts: string[]) {
  const warnings: string[] = [];
  if (!title.trim()) warnings.push('标题不能为空');
  if (!body.trim()) warnings.push('正文不能为空');

  switch (platform) {
    case 'wechat':
      if (title.trim().length > WECHAT_TITLE_MAX) {
        warnings.push(`微信公众号标题建议控制在 ${WECHAT_TITLE_MAX} 字以内`);
      }
      break;
    case 'xiaohongshu':
      if (title.trim().length > XHS_TITLE_MAX) {
        warnings.push(`小红书标题建议控制在 ${XHS_TITLE_MAX} 字以内`);
      }
      if (body.trim().length > XHS_BODY_MAX) {
        warnings.push(`小红书正文建议控制在 ${XHS_BODY_MAX} 字以内（当前 ${body.trim().length} 字）`);
      }
      break;
    case 'zhihu':
      if (title.trim().length > ZHIHU_TITLE_MAX) {
        warnings.push(`知乎标题建议控制在 ${ZHIHU_TITLE_MAX} 字以内`);
      }
      break;
    case 'x':
      if (threadParts.length > 1) {
        warnings.push(`X 内容已自动拆分为 ${threadParts.length} 条 thread`);
      }
      break;
  }

  return warnings;
}

function adaptForPlatform(
  platform: PlatformId,
  title: string,
  content: string,
): PlatformContentDraft {
  const threadParts = platform === 'x' ? splitForThread(content) : [];
  const warnings = createWarnings(platform, title, content, threadParts);
  const hasBlockingWarning = warnings.includes('标题不能为空') || warnings.includes('正文不能为空');

  return {
    platform,
    title: title.trim(),
    body: content.trim(),
    format: PLATFORM_FORMATS[platform],
    isReady: !hasBlockingWarning,
    warnings,
    threadParts,
    suggestedTags: platform === 'xiaohongshu' ? DEFAULT_TAGS : [],
  };
}

export function adaptContentForPlatforms(input: AdaptContentInput): PlatformContentDrafts {
  const drafts = {} as PlatformContentDrafts;
  for (const platform of input.platforms) {
    drafts[platform] = adaptForPlatform(platform, input.title, input.content);
  }
  return drafts;
}

export type {
  AdaptContentInput,
  PlatformContentDraft,
  PlatformContentDrafts,
};
