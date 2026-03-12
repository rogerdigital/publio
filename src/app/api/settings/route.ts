import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '.env.local');

const SECRET_KEYS = [
  'WECHAT_APP_SECRET',
  'XHS_APP_SECRET',
  'XHS_ACCESS_TOKEN',
  'ZHIHU_COOKIE',
  'X_API_SECRET',
  'X_ACCESS_TOKEN_SECRET',
];

function maskValue(key: string, value: string): string {
  if (SECRET_KEYS.includes(key) && value.length > 4) {
    return '****' + value.slice(-4);
  }
  return value;
}

function parseEnvFile(content: string): Record<string, string> {
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

function serializeEnvFile(values: Record<string, string>): string {
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

export async function GET() {
  try {
    const content = await readFile(ENV_FILE, 'utf-8');
    const values = parseEnvFile(content);

    // Mask secrets
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(values)) {
      masked[key] = maskValue(key, value);
    }

    return NextResponse.json(masked);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newValues = await request.json();

    // Read existing values first
    let existing: Record<string, string> = {};
    try {
      const content = await readFile(ENV_FILE, 'utf-8');
      existing = parseEnvFile(content);
    } catch {
      // File doesn't exist yet, that's fine
    }

    // Merge: only update non-masked values
    for (const [key, value] of Object.entries(newValues)) {
      if (typeof value === 'string' && !value.startsWith('****')) {
        existing[key] = value;
      }
    }

    await writeFile(ENV_FILE, serializeEnvFile(existing), 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存失败' },
      { status: 500 }
    );
  }
}
