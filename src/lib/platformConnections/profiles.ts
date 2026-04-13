/**
 * Client-safe platform connection profile helpers.
 * Contains no Node.js imports — safe to import from 'use client' components.
 */
import type { PlatformId } from '@/types';
import type {
  PlatformConnectionDefinition,
  PlatformConnectionProfile,
} from '@/lib/platformConnections/types';

export const PLATFORM_CONNECTIONS: PlatformConnectionDefinition[] = [
  {
    platform: 'wechat',
    mode: 'oauth',
    requiredKeys: ['WECHAT_APP_ID', 'WECHAT_APP_SECRET'],
    connectionLabel: '公众号授权',
    connectionHint: '通过授权流程连接公众号后，可减少手动复制凭证。',
  },
  {
    platform: 'xiaohongshu',
    mode: 'oauth',
    requiredKeys: ['XHS_APP_ID', 'XHS_APP_SECRET'],
    optionalKeys: ['XHS_ACCESS_TOKEN'],
    connectionLabel: '小红书授权',
    connectionHint: '优先使用开放平台授权；已有 Access Token 时仍可作为回退。',
  },
  {
    platform: 'zhihu',
    mode: 'manual',
    requiredKeys: ['ZHIHU_COOKIE'],
    connectionLabel: '登录态配置',
    connectionHint: '当前知乎发布依赖浏览器 Cookie，后续可替换为更稳定的授权方式。',
  },
  {
    platform: 'x',
    mode: 'oauth',
    requiredKeys: [
      'X_API_KEY',
      'X_API_SECRET',
      'X_ACCESS_TOKEN',
      'X_ACCESS_TOKEN_SECRET',
    ],
    connectionLabel: 'X 授权',
    connectionHint: '通过开发者授权连接账号；手动 API Key 可作为高级配置。',
  },
];

function hasValue(value: string | undefined) {
  return Boolean(value?.trim());
}

export function getPlatformConnectionProfiles(
  values: Record<string, string>,
): PlatformConnectionProfile[] {
  return PLATFORM_CONNECTIONS.map((definition) => {
    const configuredKeys = definition.requiredKeys.filter((key) => hasValue(values[key]));
    const missingKeys = definition.requiredKeys.filter((key) => !hasValue(values[key]));
    const hasAllRequired = missingKeys.length === 0;
    const status = hasAllRequired
      ? 'connected'
      : definition.mode === 'oauth'
        ? 'available'
        : 'manual-required';

    return {
      ...definition,
      status,
      configuredKeys,
      missingKeys,
      actionLabel: status === 'connected'
        ? '重新连接'
        : definition.mode === 'oauth'
          ? '一键授权'
          : '填写登录态',
    };
  });
}

export function getPlatformConnectionProfile(
  values: Record<string, string>,
  platform: PlatformId,
) {
  return getPlatformConnectionProfiles(values).find((profile) => profile.platform === platform);
}
