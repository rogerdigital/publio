import { describe, expect, test, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';

import type { PlatformContentDrafts } from '@/lib/platformAdapters/types';

vi.mock('@/components/publish/publish.css', () => ({
  panelKicker: 'panelKicker',
  previewPanel: 'previewPanel',
  previewHeader: 'previewHeader',
  previewTitle: 'previewTitle',
  previewGrid: 'previewGrid',
  previewCard: 'previewCard',
  previewMeta: 'previewMeta',
  previewPlatform: 'previewPlatform',
  previewState: 'previewState',
  previewField: 'previewField',
  previewLabel: 'previewLabel',
  previewInput: 'previewInput',
  previewTextarea: 'previewTextarea',
  previewBody: 'previewBody',
  previewWarningList: 'previewWarningList',
  previewTagList: 'previewTagList',
  previewThreadList: 'previewThreadList',
}));

describe('PlatformPreviewPanel', () => {
  test('renders selected platform adaptations with warnings and thread parts', async () => {
    const { default: PlatformPreviewPanel } = await import(
      '@/components/publish/PlatformPreviewPanel'
    );
    const adaptations: PlatformContentDrafts = {
      wechat: {
        platform: 'wechat',
        title: '稿件标题',
        body: '公众号正文',
        format: 'article',
        isReady: true,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
      xiaohongshu: {
        platform: 'xiaohongshu',
        title: '很长的小红书标题',
        body: '小红书正文',
        format: 'note',
        isReady: true,
        warnings: ['小红书标题建议控制在 20 字以内'],
        threadParts: [],
        suggestedTags: ['AI', '科技'],
      },
      zhihu: {
        platform: 'zhihu',
        title: '稿件标题',
        body: '知乎正文',
        format: 'article',
        isReady: true,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
      x: {
        platform: 'x',
        title: '稿件标题',
        body: 'X 正文',
        format: 'thread',
        isReady: true,
        warnings: ['X 内容已自动拆分为 thread'],
        threadParts: ['第一条', '第二条'],
        suggestedTags: [],
      },
    };

    const onUpdate = vi.fn();

    render(createElement(PlatformPreviewPanel, {
      adaptations,
      selectedPlatforms: ['xiaohongshu', 'x'],
      onUpdate,
    }));

    expect(screen.getByText('分发前预览')).toBeInTheDocument();
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('小红书标题建议控制在 20 字以内')).toBeInTheDocument();
    expect(screen.getByText('#AI')).toBeInTheDocument();
    expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByText('X 内容已自动拆分为 thread')).toBeInTheDocument();
    expect(screen.getByText('1. 第一条')).toBeInTheDocument();
    expect(screen.getByText('2. 第二条')).toBeInTheDocument();
    expect(screen.queryByText('微信公众号')).not.toBeInTheDocument();
  });

  test('emits platform-level title and body edits', async () => {
    const { default: PlatformPreviewPanel } = await import(
      '@/components/publish/PlatformPreviewPanel'
    );
    const adaptations: PlatformContentDrafts = {
      wechat: {
        platform: 'wechat',
        title: '公众号标题',
        body: '公众号正文',
        format: 'article',
        isReady: true,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
      xiaohongshu: {
        platform: 'xiaohongshu',
        title: '',
        body: '',
        format: 'note',
        isReady: false,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
      zhihu: {
        platform: 'zhihu',
        title: '',
        body: '',
        format: 'article',
        isReady: false,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
      x: {
        platform: 'x',
        title: '',
        body: '',
        format: 'thread',
        isReady: false,
        warnings: [],
        threadParts: [],
        suggestedTags: [],
      },
    };
    const onUpdate = vi.fn();

    render(createElement(PlatformPreviewPanel, {
      adaptations,
      selectedPlatforms: ['wechat'],
      onUpdate,
    }));

    fireEvent.change(screen.getByLabelText('微信公众号标题'), {
      target: { value: '新的公众号标题' },
    });
    fireEvent.change(screen.getByLabelText('微信公众号正文'), {
      target: { value: '新的公众号正文' },
    });

    expect(onUpdate).toHaveBeenCalledWith('wechat', { title: '新的公众号标题' });
    expect(onUpdate).toHaveBeenCalledWith('wechat', { body: '新的公众号正文' });
  });
});
