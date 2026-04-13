import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { parseEnvFile, serializeEnvFile } from '@/lib/storage/envFile';

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
