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

  test('resets publish progress state without touching core draft content', () => {
    usePublishStore.getState().setTitle('稿件标题');
    usePublishStore.getState().setContent('正文内容');
    usePublishStore.getState().setLastSyncTaskId('sync-1');
    usePublishStore.getState().openProgressOverlay();
    usePublishStore.getState().reset();

    expect(usePublishStore.getState().title).toBe('稿件标题');
    expect(usePublishStore.getState().content).toBe('正文内容');
    expect(usePublishStore.getState().overallStatus).toBe('idle');
    expect(usePublishStore.getState().lastSyncTaskId).toBeNull();
    expect(usePublishStore.getState().isProgressOverlayOpen).toBe(false);
  });
});
