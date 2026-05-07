import { readdirSync, statSync } from 'node:fs';
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
      files = readdirSync(dir);
    } catch {
      return apiResponse({ uploads: [] });
    }

    const imageExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
    const uploads: UploadEntry[] = files
      .filter((f) => {
        const ext = '.' + f.split('.').pop()?.toLowerCase();
        return imageExts.has(ext);
      })
      .map((filename) => {
        const filepath = join(dir, filename);
        const stat = statSync(filepath);
        return {
          filename,
          url: `/api/uploads/${filename}`,
          size: stat.size,
          createdAt: stat.birthtime.toISOString(),
        };
      })
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    return apiResponse({ uploads });
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取上传列表失败';
    return apiError(message, 500);
  }
}
