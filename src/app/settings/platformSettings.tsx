import type { ReactNode } from 'react';
import { WechatIcon, XiaohongshuIcon, ZhihuIcon, XIcon } from '@/components/icons/PlatformIcons';
import type {
  PlatformConnectionStatus,
  PlatformHealthStatus,
} from '@/lib/platformConnections/types';
import type { PlatformId } from '@/types';
import * as styles from './settings.css';

export interface PlatformConfig {
  id: PlatformId;
  name: string;
  Icon: React.ComponentType<{ size?: number }>;
  summary: string;
  hint: ReactNode;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'textarea';
    placeholder: string;
  }[];
}

export const platformConfigs: PlatformConfig[] = [
  {
    id: 'wechat',
    name: '微信公众号',
    Icon: WechatIcon,
    summary: '文章分发与公众号素材投递',
    hint: (
      <>
        前往 <code className={styles.inlineCode}>mp.weixin.qq.com</code> → 开发 → 基本配置，获取
        AppID 和 AppSecret
      </>
    ),
    fields: [
      { key: 'WECHAT_APP_ID', label: 'App ID', type: 'text', placeholder: '输入微信公众号 App ID' },
      {
        key: 'WECHAT_APP_SECRET',
        label: 'App Secret',
        type: 'password',
        placeholder: '输入微信公众号 App Secret',
      },
    ],
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    Icon: XiaohongshuIcon,
    summary: '图文分发与笔记发布通道',
    hint: '前往小红书开放平台注册开发者账号并创建应用',
    fields: [
      { key: 'XHS_APP_ID', label: 'App ID', type: 'text', placeholder: '输入小红书 App ID' },
      {
        key: 'XHS_APP_SECRET',
        label: 'App Secret',
        type: 'password',
        placeholder: '输入小红书 App Secret',
      },
      {
        key: 'XHS_ACCESS_TOKEN',
        label: 'Access Token',
        type: 'password',
        placeholder: '输入小红书 Access Token（可选，授权后自动写入）',
      },
    ],
  },
  {
    id: 'zhihu',
    name: '知乎',
    Icon: ZhihuIcon,
    summary: '长文转载与问答场景投递',
    hint: '使用浏览器登录知乎后，在开发者工具的 Network 面板中复制 Cookie',
    fields: [
      {
        key: 'ZHIHU_COOKIE',
        label: 'Cookie',
        type: 'textarea',
        placeholder: '从浏览器开发者工具中复制知乎的 Cookie',
      },
      {
        key: 'ZHIHU_COLUMN_TOKEN',
        label: '专栏 Token',
        type: 'text',
        placeholder: '可选，知乎专栏 url_token',
      },
      {
        key: 'ZHIHU_TOPIC_TOKENS',
        label: '话题 Tokens',
        type: 'text',
        placeholder: '可选，多个 topic url_token 用英文逗号分隔',
      },
    ],
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    Icon: XIcon,
    summary: '短帖同步与外部扩散',
    hint: (
      <>
        前往 <code className={styles.inlineCode}>developer.x.com</code> 创建项目并生成 API Keys 和
        Access Tokens
      </>
    ),
    fields: [
      { key: 'X_API_KEY', label: 'API Key', type: 'text', placeholder: '输入 X API Key' },
      {
        key: 'X_API_SECRET',
        label: 'API Secret',
        type: 'password',
        placeholder: '输入 X API Secret',
      },
      {
        key: 'X_ACCESS_TOKEN',
        label: 'Access Token',
        type: 'text',
        placeholder: '输入 X Access Token',
      },
      {
        key: 'X_ACCESS_TOKEN_SECRET',
        label: 'Access Token Secret',
        type: 'password',
        placeholder: '输入 X Access Token Secret',
      },
    ],
  },
];

export const VERIFY_ONLY_PLATFORMS = new Set<PlatformId>(['wechat', 'x']);

export const statusLabels: Record<PlatformConnectionStatus, string> = {
  connected: '已连接',
  available: '可授权',
  'manual-required': '需配置',
};

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export function getHealthSummary(health: PlatformHealthStatus): {
  label: string;
  tone: 'ok' | 'warn' | 'error';
} {
  if (!health.configured) {
    return { label: `缺少配置：${health.missingFields.join(', ')}`, tone: 'error' };
  }
  if (!health.valid) {
    return { label: health.failureReason || '凭证无效', tone: 'warn' };
  }
  return { label: health.accountName ? `${health.accountName} · 已就绪` : '已就绪', tone: 'ok' };
}
