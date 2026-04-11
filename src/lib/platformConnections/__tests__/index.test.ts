import { describe, expect, test } from 'vitest';

import {
  getPlatformConnectionProfile,
  getPlatformConnectionProfiles,
} from '@/lib/platformConnections';

describe('platform connection profiles', () => {
  test('marks oauth platforms as available before all required values are configured', () => {
    const wechat = getPlatformConnectionProfile({}, 'wechat');

    expect(wechat).toMatchObject({
      platform: 'wechat',
      mode: 'oauth',
      status: 'available',
      actionLabel: '一键授权',
      missingKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
    });
  });

  test('marks a platform as connected when all required values exist', () => {
    const x = getPlatformConnectionProfile(
      {
        X_API_KEY: 'key',
        X_API_SECRET: 'secret',
        X_ACCESS_TOKEN: 'token',
        X_ACCESS_TOKEN_SECRET: 'token-secret',
      },
      'x',
    );

    expect(x).toMatchObject({
      platform: 'x',
      status: 'connected',
      actionLabel: '重新连接',
      missingKeys: [],
    });
  });

  test('keeps manual-only platforms separate from oauth entry points', () => {
    const profiles = getPlatformConnectionProfiles({});
    const zhihu = profiles.find((profile) => profile.platform === 'zhihu');

    expect(zhihu).toMatchObject({
      platform: 'zhihu',
      mode: 'manual',
      status: 'manual-required',
      actionLabel: '填写登录态',
    });
  });
});
