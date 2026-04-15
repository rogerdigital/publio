import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

import type { PlatformContentDrafts } from '@/lib/platformAdapters/types';

vi.mock('@/components/publish/publish.css', () => ({
  selectorWrap: 'selectorWrap',
  selectorFooter: 'selectorFooter',
  selectorToggleAll: 'selectorToggleAll',
  platformLabel: 'platformLabel',
  srOnly: 'srOnly',
  publishButton: 'publishButton',
  panel: 'panel',
  panelHeader: 'panelHeader',
  panelKicker: 'panelKicker',
  panelTitle: 'panelTitle',
  panelStats: 'panelStats',
  statBadge: 'statBadge',
  resultList: 'resultList',
  resultCardVariants: () => 'resultCardVariants',
  resultPlatformRow: 'resultPlatformRow',
  platformIconWrap: 'platformIconWrap',
  platformName: 'platformName',
  platformSubLabel: 'platformSubLabel',
  resultMessage: 'resultMessage',
  resultMessageTextVariants: () => 'resultMessageTextVariants',
  resultActions: 'resultActions',
  statusBadgeVariants: () => 'statusBadgeVariants',
  externalLink: 'externalLink',
  loadingWrap: 'loadingWrap',
  loadingCard: 'loadingCard',
  loadingText: 'loadingText',
  loadingPlaceholder: 'loadingPlaceholder',
  previewPanel: 'previewPanel',
  previewHeader: 'previewHeader',
  previewTitle: 'previewTitle',
  previewGrid: 'previewGrid',
  previewCard: 'previewCard',
  previewMeta: 'previewMeta',
  previewPlatform: 'previewPlatform',
  previewState: 'previewState',
  previewStateNotReady: 'previewStateNotReady',
  previewBody: 'previewBody',
  previewImage: 'previewImage',
  previewWarningList: 'previewWarningList',
  previewTagList: 'previewTagList',
  previewThreadList: 'previewThreadList',
  rightPanelSection: 'rightPanelSection',
  rightPanelSectionTitle: 'rightPanelSectionTitle',
  collapseToggle: 'collapseToggle',
  collapseContent: 'collapseContent',
  collapseChevron: 'collapseChevron',
  collapseChevronOpen: 'collapseChevronOpen',
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

    render(createElement(PlatformPreviewPanel, {
      adaptations,
      selectedPlatforms: ['xiaohongshu', 'x'],
    }));

    expect(screen.getByText('内容配置')).toBeInTheDocument();
    expect(screen.getByText('小红书')).toBeInTheDocument();
    expect(screen.getByText('小红书标题建议控制在 20 字以内')).toBeInTheDocument();
    expect(screen.getByText('X (Twitter)')).toBeInTheDocument();
    expect(screen.getByText('X 内容已自动拆分为 thread')).toBeInTheDocument();
    expect(screen.getByText('1. 第一条')).toBeInTheDocument();
    expect(screen.getByText('2. 第二条')).toBeInTheDocument();
    expect(screen.queryByText('微信公众号')).not.toBeInTheDocument();
  });
});
