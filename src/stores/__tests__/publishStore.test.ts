import { beforeEach, describe, expect, test } from 'vitest';

import { usePublishStore } from '@/stores/publishStore';

describe('publishStore platform drafts', () => {
  beforeEach(() => {
    usePublishStore.setState(usePublishStore.getInitialState(), true);
  });

  test('syncs platform drafts from the shared title and content', () => {
    usePublishStore.getState().setTitle('稿件标题');
    usePublishStore.getState().setContent('正文内容');
    usePublishStore.getState().syncPlatformDrafts();

    expect(usePublishStore.getState().platformDrafts.wechat).toMatchObject({
      platform: 'wechat',
      title: '稿件标题',
      body: '正文内容',
      format: 'article',
      isReady: true,
    });
    expect(usePublishStore.getState().platformDrafts.x).toMatchObject({
      platform: 'x',
      title: '稿件标题',
      body: '正文内容',
      format: 'thread',
      isReady: true,
    });
  });

  test('supports platform-level draft edits without changing shared content', () => {
    usePublishStore.getState().setTitle('通用标题');
    usePublishStore.getState().setContent('通用正文');
    usePublishStore.getState().syncPlatformDrafts();

    usePublishStore.getState().updatePlatformDraft('xiaohongshu', {
      title: '小红书标题',
      body: '小红书正文',
      suggestedTags: ['AI', '选题'],
    });

    expect(usePublishStore.getState().title).toBe('通用标题');
    expect(usePublishStore.getState().content).toBe('通用正文');
    expect(usePublishStore.getState().platformDrafts.xiaohongshu).toMatchObject({
      title: '小红书标题',
      body: '小红书正文',
      suggestedTags: ['AI', '选题'],
    });
  });
});
