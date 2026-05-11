import { beforeEach, describe, expect, test } from 'vitest';

import { runPublishChecks } from '@/lib/publishChecks/runChecks';
import { resetPlatformVariantRegistryForTests } from '@/lib/platformVariants/registry';

describe('runPublishChecks', () => {
  beforeEach(() => {
    resetPlatformVariantRegistryForTests({
      createId: () => 'v-1',
      now: () => '2026-05-11T00:00:00.000Z',
    });
  });

  test('returns error when title is empty', () => {
    const result = runPublishChecks({
      title: '',
      content: '正文',
      platforms: ['wechat'],
    });
    expect(result.canPublish).toBe(false);
    expect(result.checks.some((c) => c.severity === 'error' && c.field === 'title')).toBe(true);
  });

  test('returns error when content is empty', () => {
    const result = runPublishChecks({
      title: '标题',
      content: '',
      platforms: ['wechat'],
    });
    expect(result.canPublish).toBe(false);
    expect(result.checks.some((c) => c.severity === 'error' && c.field === 'content')).toBe(true);
  });

  test('returns warning for content exceeding platform limits', () => {
    const longContent = '这是一段'.repeat(300);
    const result = runPublishChecks({
      title: '标题',
      content: longContent,
      platforms: ['xiaohongshu'],
    });
    expect(result.canPublish).toBe(true);
    expect(result.hasWarnings).toBe(true);
    expect(
      result.checks.some((c) => c.severity === 'warning' && c.platform === 'xiaohongshu'),
    ).toBe(true);
  });

  test('returns info when no variant exists', () => {
    const result = runPublishChecks({
      title: '标题',
      content: '正文内容',
      platforms: ['wechat'],
    });
    expect(result.canPublish).toBe(true);
    expect(result.checks.some((c) => c.severity === 'info' && c.platform === 'wechat')).toBe(true);
  });

  test('uses variant content for validation when variantId provided', () => {
    const store = resetPlatformVariantRegistryForTests({
      createId: () => 'v-xhs',
      now: () => '2026-05-11T00:00:00.000Z',
    });
    store.createVariant({
      draftId: 'draft-1',
      platform: 'xiaohongshu',
      title: '短标题',
      content: '短内容',
    });

    const result = runPublishChecks({
      title: '这是一个很长的标题不会被使用',
      content: '主稿很长'.repeat(500),
      platforms: ['xiaohongshu'],
      variantIds: { xiaohongshu: 'v-xhs' },
    });

    // Variant content is short, so no xiaohongshu length warning
    const xhsWarnings = result.checks.filter(
      (c) => c.platform === 'xiaohongshu' && c.severity === 'warning' && c.message.includes('超出'),
    );
    expect(xhsWarnings).toHaveLength(0);
  });

  test('passes all checks with valid content', () => {
    const result = runPublishChecks({
      title: '有效标题',
      content: '有效正文内容，足够长度。',
      platforms: ['wechat', 'zhihu'],
    });
    expect(result.canPublish).toBe(true);
    expect(result.checks.filter((c) => c.severity === 'error')).toHaveLength(0);
  });

  test('groups checks by platform', () => {
    const result = runPublishChecks({
      title: '',
      content: '',
      platforms: ['wechat', 'xiaohongshu'],
    });
    expect(result.byPlatform['global']).toBeDefined();
    expect(result.byPlatform['global'].length).toBeGreaterThan(0);
  });
});
