import { describe, expect, test } from 'vitest';

import {
  resolveOverallPublishStatus,
  syncTaskToPublishResults,
  toPublishResultDisplayState,
} from '@/lib/publishStatus';
import type { PlatformPublishResult } from '@/types';

describe('publish status helpers', () => {
  test('treats draft-created, published, success, and needs-action as non-error outcomes', () => {
    const results: PlatformPublishResult[] = [
      { platform: 'wechat', status: 'draft-created' },
      { platform: 'zhihu', status: 'published' },
      { platform: 'x', status: 'success' },
      { platform: 'xiaohongshu', status: 'needs-action' },
    ];

    expect(resolveOverallPublishStatus(results)).toBe('success');
  });

  test('treats failed and legacy error results as overall errors', () => {
    expect(
      resolveOverallPublishStatus([{ platform: 'wechat', status: 'failed' }]),
    ).toBe('error');
    expect(
      resolveOverallPublishStatus([{ platform: 'wechat', status: 'error' }]),
    ).toBe('error');
  });

  test('maps platform statuses to existing panel display states', () => {
    expect(toPublishResultDisplayState('draft-created')).toBe('success');
    expect(toPublishResultDisplayState('published')).toBe('success');
    expect(toPublishResultDisplayState('needs-action')).toBe('success');
    expect(toPublishResultDisplayState('failed')).toBe('error');
    expect(toPublishResultDisplayState('error')).toBe('error');
    expect(toPublishResultDisplayState('publishing')).toBe('publishing');
  });

  test('maps sync task receipts back into publish results', () => {
    expect(syncTaskToPublishResults({
      id: 'sync-1',
      title: '稿件标题',
      status: 'partial',
      createdAt: '2026-04-23T09:00:00.000Z',
      updatedAt: '2026-04-23T09:01:00.000Z',
      events: [],
      receipts: [
        {
          platform: 'wechat',
          status: 'published',
          message: '已发布',
          attempts: 1,
          updatedAt: '2026-04-23T09:01:00.000Z',
        },
        {
          platform: 'zhihu',
          status: 'syncing',
          message: '正在发布',
          attempts: 1,
          updatedAt: '2026-04-23T09:01:00.000Z',
        },
        {
          platform: 'x',
          status: 'failed',
          message: '原始错误',
          failureMessage: '整理后的错误',
          attempts: 1,
          updatedAt: '2026-04-23T09:01:00.000Z',
        },
      ],
    })).toEqual([
      { platform: 'wechat', status: 'published', message: '已发布', url: undefined },
      { platform: 'zhihu', status: 'publishing', message: '正在发布', url: undefined },
      { platform: 'x', status: 'failed', message: '整理后的错误', url: undefined },
    ]);
  });
});
