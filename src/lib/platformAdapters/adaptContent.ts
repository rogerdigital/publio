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
  if (platform === 'xiaohongshu' && title.trim().length > 20) {
    warnings.push('小红书标题建议控制在 20 字以内');
  }
  if (platform === 'x' && threadParts.length > 1) {
    warnings.push('X 内容已自动拆分为 thread');
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

  return {
    platform,
    title: title.trim(),
    body: content.trim(),
    format: PLATFORM_FORMATS[platform],
    isReady: !warnings.includes('标题不能为空') && !warnings.includes('正文不能为空'),
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
