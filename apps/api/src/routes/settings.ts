import { Hono } from 'hono';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseEnvFile, serializeEnvFile } from '@/lib/storage/envFile';
import { apiResponse, apiError } from '@/lib/response';

const ENV_FILE = join(process.cwd(), '.env.local');

const SECRET_KEYS = [
  'WECHAT_APP_SECRET',
  'XHS_APP_SECRET',
  'XHS_ACCESS_TOKEN',
  'ZHIHU_COOKIE',
  'X_API_SECRET',
  'X_ACCESS_TOKEN_SECRET',
  'AGENT_API_KEY',
  'GITHUB_IMAGE_TOKEN',
];

const WRITABLE_KEYS = [
  'WECHAT_APP_ID',
  'WECHAT_APP_SECRET',
  'XHS_APP_ID',
  'XHS_APP_SECRET',
  'XHS_ACCESS_TOKEN',
  'ZHIHU_COOKIE',
  'X_API_KEY',
  'X_API_SECRET',
  'X_ACCESS_TOKEN',
  'X_ACCESS_TOKEN_SECRET',
  'AGENT_BASE_URL',
  'AGENT_API_KEY',
  'AGENT_MODEL',
  'AGENT_MAX_TOKENS',
  'AGENT_TEMPERATURE',
  'GITHUB_IMAGE_ENABLED',
  'GITHUB_IMAGE_TOKEN',
  'GITHUB_IMAGE_OWNER',
  'GITHUB_IMAGE_REPO',
  'GITHUB_IMAGE_BRANCH',
  'GITHUB_IMAGE_PATH',
] as const;

const writableKeySet = new Set<string>(WRITABLE_KEYS);
const secretKeySet = new Set<string>(SECRET_KEYS);

function maskValue(key: string, value: string): string {
  if (secretKeySet.has(key) && value.length > 4) {
    return '****' + value.slice(-4);
  }
  return value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isMaskedSecretValue(key: string, value: string): boolean {
  return secretKeySet.has(key) && value.startsWith('****');
}

function validateSettingValue(key: string, value: string): string | null {
  if (key === 'GITHUB_IMAGE_ENABLED' && value && value !== 'true' && value !== 'false') {
    return 'GITHUB_IMAGE_ENABLED 必须为 true 或 false';
  }
  if (key === 'AGENT_MAX_TOKENS' && value) {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      return 'AGENT_MAX_TOKENS 必须为正整数';
    }
  }
  if (key === 'AGENT_TEMPERATURE' && value) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 2) {
      return 'AGENT_TEMPERATURE 必须在 0 到 2 之间';
    }
  }
  return null;
}

export const settingsRoutes = new Hono();

settingsRoutes.get('/', async (c) => {
  try {
    const content = await readFile(ENV_FILE, 'utf-8');
    const values = parseEnvFile(content);
    const masked: Record<string, string> = {};
    for (const key of WRITABLE_KEYS) {
      if (values[key] !== undefined) {
        masked[key] = maskValue(key, values[key]);
      }
    }
    return apiResponse(c, masked);
  } catch {
    return apiResponse(c, {});
  }
});

settingsRoutes.put('/', async (c) => {
  try {
    const newValues = await c.req.json();
    if (!isRecord(newValues)) {
      return apiError(c, '设置内容必须是对象', 400);
    }

    const updates: Record<string, string> = {};
    for (const [key, value] of Object.entries(newValues)) {
      if (!writableKeySet.has(key)) {
        return apiError(c, `不支持的设置项: ${key}`, 400, { key });
      }
      if (typeof value !== 'string') {
        return apiError(c, `设置项 ${key} 必须是字符串`, 400, { key });
      }
      const validationError = validateSettingValue(key, value);
      if (validationError) {
        return apiError(c, validationError, 400, { key });
      }
      updates[key] = value;
    }

    let existing: Record<string, string> = {};
    try {
      const content = await readFile(ENV_FILE, 'utf-8');
      existing = parseEnvFile(content);
    } catch {
      // File doesn't exist yet
    }

    for (const [key, value] of Object.entries(updates)) {
      if (!isMaskedSecretValue(key, value)) {
        existing[key] = value;
      }
    }

    await writeFile(ENV_FILE, serializeEnvFile(existing), 'utf-8');
    return apiResponse(c, { success: true });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '保存失败', 500);
  }
});
