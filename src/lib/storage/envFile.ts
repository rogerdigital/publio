import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '.env.local');

export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    result[key] = value;
  }
  return result;
}

export function serializeEnvFile(values: Record<string, string>): string {
  const lines = [
    '# WeChat Official Account',
    `WECHAT_APP_ID=${values.WECHAT_APP_ID || ''}`,
    `WECHAT_APP_SECRET=${values.WECHAT_APP_SECRET || ''}`,
    '',
    '# Xiaohongshu (RED)',
    `XHS_APP_ID=${values.XHS_APP_ID || ''}`,
    `XHS_APP_SECRET=${values.XHS_APP_SECRET || ''}`,
    `XHS_ACCESS_TOKEN=${values.XHS_ACCESS_TOKEN || ''}`,
    '',
    '# Zhihu',
    `ZHIHU_COOKIE=${values.ZHIHU_COOKIE || ''}`,
    '',
    '# X (Twitter)',
    `X_API_KEY=${values.X_API_KEY || ''}`,
    `X_API_SECRET=${values.X_API_SECRET || ''}`,
    `X_ACCESS_TOKEN=${values.X_ACCESS_TOKEN || ''}`,
    `X_ACCESS_TOKEN_SECRET=${values.X_ACCESS_TOKEN_SECRET || ''}`,
  ];
  return lines.join('\n') + '\n';
}

export async function readEnvFile(): Promise<Record<string, string>> {
  try {
    const content = await readFile(ENV_FILE, 'utf-8');
    return parseEnvFile(content);
  } catch {
    return {};
  }
}

export async function writeEnvKey(key: string, value: string): Promise<void> {
  const existing = await readEnvFile();
  existing[key] = value;
  await writeFile(ENV_FILE, serializeEnvFile(existing), 'utf-8');
}
