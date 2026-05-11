import { describe, expect, test, vi } from 'vitest';

import {
  getPlatformConnectionProfile,
  getPlatformConnectionProfiles,
} from '@/lib/platformConnections';
import { getHealthStatuses } from '@/lib/platformConnections/checkers';
import type { PlatformConnectionProfile } from '@/lib/platformConnections/types';

vi.mock('@/lib/config', () => ({
  getWechatConfig: () => ({ appId: 'test-id', appSecret: 'test-secret' }),
  getXhsConfig: () => ({ appId: '', appSecret: '' }),
  getZhihuConfig: () => ({ cookie: 'test-cookie' }),
  getXConfig: () => ({ apiKey: '', apiSecret: '', accessToken: '', accessTokenSecret: '' }),
}));

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

describe('getHealthStatuses', () => {
  test('reports missing configuration fields', async () => {
    const profiles: PlatformConnectionProfile[] = [
      {
        platform: 'wechat',
        mode: 'oauth',
        requiredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        connectionLabel: '微信公众号',
        connectionHint: '',
        status: 'available',
        configuredKeys: [],
        missingKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        actionLabel: '一键授权',
      },
    ];

    const results = await getHealthStatuses(profiles);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      platform: 'wechat',
      configured: false,
      valid: false,
      missingFields: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
      nextAction: '填写: WECHAT_APP_ID, WECHAT_APP_SECRET',
    });
  });

  test('reports valid status when credentials pass check', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ access_token: 'test', expires_in: 7200 }),
    });

    const profiles: PlatformConnectionProfile[] = [
      {
        platform: 'wechat',
        mode: 'oauth',
        requiredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        connectionLabel: '微信公众号',
        connectionHint: '',
        status: 'connected',
        configuredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        missingKeys: [],
        actionLabel: '重新连接',
      },
    ];

    const results = await getHealthStatuses(profiles);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      platform: 'wechat',
      configured: true,
      valid: true,
    });
  });

  test('reports failure when API check fails', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      json: () => Promise.resolve({ errcode: 40001, errmsg: 'invalid credential' }),
    });

    const profiles: PlatformConnectionProfile[] = [
      {
        platform: 'wechat',
        mode: 'oauth',
        requiredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        connectionLabel: '微信公众号',
        connectionHint: '',
        status: 'connected',
        configuredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
        missingKeys: [],
        actionLabel: '重新连接',
      },
    ];

    const results = await getHealthStatuses(profiles);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      platform: 'wechat',
      configured: true,
      valid: false,
      nextAction: '重新配置凭证',
    });
    expect(results[0].failureReason).toContain('invalid credential');
  });
});
