import type { PlatformRule } from './types';

export const PLATFORM_RULES: PlatformRule[] = [
  {
    platform: 'wechat',
    title: { maxLength: 64 },
    content: { maxLength: 20000 },
    images: { maxCount: 20, required: false },
  },
  {
    platform: 'xiaohongshu',
    title: { maxLength: 20 },
    content: { maxLength: 1000 },
    images: { maxCount: 9, required: false },
  },
  {
    platform: 'zhihu',
    title: { maxLength: 50 },
    content: { maxLength: 50000, minLength: 0 },
  },
  {
    platform: 'x',
    content: { maxLength: 280 },
  },
];

export function getRuleForPlatform(platform: string): PlatformRule | undefined {
  return PLATFORM_RULES.find((r) => r.platform === platform);
}
