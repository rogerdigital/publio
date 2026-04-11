import { describe, expect, test } from 'vitest';

import { adaptContentForPlatforms } from '@/lib/platformAdapters/adaptContent';

describe('adaptContentForPlatforms', () => {
  test('creates platform-specific drafts with validation warnings', () => {
    const longXContent = `${'这是面向 X 的长内容。'.repeat(24)} https://example.com`;

    const adaptations = adaptContentForPlatforms({
      title: '这是一条很长很长很长很长很长很长的小红书标题',
      content: longXContent,
      platforms: ['wechat', 'xiaohongshu', 'zhihu', 'x'],
    });

    expect(adaptations.wechat).toMatchObject({
      platform: 'wechat',
      title: '这是一条很长很长很长很长很长很长的小红书标题',
      format: 'article',
      isReady: true,
    });
    expect(adaptations.xiaohongshu.warnings).toContain('小红书标题建议控制在 20 字以内');
    expect(adaptations.xiaohongshu.suggestedTags).toEqual(['AI', '科技', '内容分发']);
    expect(adaptations.zhihu).toMatchObject({
      platform: 'zhihu',
      format: 'article',
      isReady: true,
    });
    expect(adaptations.x.format).toBe('thread');
    expect(adaptations.x.threadParts.length).toBeGreaterThan(1);
    expect(adaptations.x.threadParts.every((part) => part.length <= 260)).toBe(true);
    expect(adaptations.x.warnings).toContain('X 内容已自动拆分为 thread');
  });

  test('marks empty platform content as not ready', () => {
    const adaptations = adaptContentForPlatforms({
      title: '',
      content: '',
      platforms: ['wechat', 'x'],
    });

    expect(adaptations.wechat.isReady).toBe(false);
    expect(adaptations.wechat.warnings).toContain('标题不能为空');
    expect(adaptations.wechat.warnings).toContain('正文不能为空');
    expect(adaptations.x.isReady).toBe(false);
  });
});
