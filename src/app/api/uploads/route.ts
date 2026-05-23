import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface UploadEntry {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export async function GET() {
  try {
    const dir = createLocalDataPath('uploads');
    let files: string[];
    try {
      files = await readdir(dir);
    } catch {
      return apiResponse({ uploads: [] });
    }

    const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
    const entries: UploadEntry[] = [];

    for (const filename of files) {
      const ext = '.' + filename.split('.').pop()?.toLowerCase();
      if (!imageExts.has(ext)) continue;

      const filepath = join(dir, filename);
      const fileStat = await stat(filepath);
      entries.push({
        filename,
        url: `/api/uploads/${filename}`,
        size: fileStat.size,
        createdAt: fileStat.birthtime.toISOString(),
      });
    }

    entries.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return apiResponse({ uploads: entries });
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取上传列表失败';
    return apiError(message, 500);
  }
}
