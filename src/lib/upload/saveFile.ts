import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createLocalDataPath } from '@/lib/storage/localDataPath';

const ALLOWED_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const EXT_MAP: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

export async function saveUploadedFile(file: File): Promise<{ url: string; filename: string }> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error('文件大小不能超过 5MB');
  }

  const ext = EXT_MAP[file.type] || 'png';
  const filename = `${randomUUID()}.${ext}`;
  const dir = createLocalDataPath('uploads');
  mkdirSync(dir, { recursive: true });
  const filepath = join(dir, filename);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  writeFileSync(filepath, buffer);

  return { url: `/api/uploads/${filename}`, filename };
}

export function getUploadFilePath(filename: string): string {
  // 防止路径遍历
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
  if (!safe || safe !== filename) {
    throw new Error('无效文件名');
  }
  return createLocalDataPath(`uploads/${safe}`);
}
