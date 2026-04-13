import { describe, expect, test } from 'vitest';

import {
  resolveOverallPublishStatus,
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
});
