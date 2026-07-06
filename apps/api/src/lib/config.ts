import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnvFile } from '@/lib/storage/envFile';

const ENV_FILE = join(process.cwd(), '.env.local');

let envLoaded = false;

/**
 * 把 .env.local 合并进 process.env（文件优先），只在首次调用时读取一次。
 * 调用 invalidateEnvCache() 可在写入 .env.local 后强制下次重新加载。
 */
function ensureEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;
  if (!existsSync(ENV_FILE)) return;
  try {
    const values = parseEnvFile(readFileSync(ENV_FILE, 'utf-8'));
    for (const [key, value] of Object.entries(values)) {
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // 读取失败则回退到纯 process.env
  }
}

/** 读取单个环境变量（已合并 .env.local，文件优先）。 */
export function getEnvValue(key: string): string {
  ensureEnvLoaded();
  return process.env[key] || '';
}

/** settings 写入 .env.local 后调用，强制下次 getter 重新加载文件。 */
export function invalidateEnvCache(): void {
  envLoaded = false;
}

export function getWechatConfig() {
  ensureEnvLoaded();
  return {
    appId: process.env.WECHAT_APP_ID || '',
    appSecret: process.env.WECHAT_APP_SECRET || '',
  };
}

export function getXhsConfig() {
  ensureEnvLoaded();
  return {
    appId: process.env.XHS_APP_ID || '',
    appSecret: process.env.XHS_APP_SECRET || '',
    accessToken: process.env.XHS_ACCESS_TOKEN || '',
  };
}

export function getZhihuConfig() {
  ensureEnvLoaded();
  return {
    cookie: process.env.ZHIHU_COOKIE || '',
    columnToken: process.env.ZHIHU_COLUMN_TOKEN || '',
    topicTokens: (process.env.ZHIHU_TOPIC_TOKENS || '')
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean),
  };
}

export function getXConfig() {
  ensureEnvLoaded();
  return {
    apiKey: process.env.X_API_KEY || '',
    apiSecret: process.env.X_API_SECRET || '',
    accessToken: process.env.X_ACCESS_TOKEN || '',
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET || '',
  };
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
}
