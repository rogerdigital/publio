import { Hono } from 'hono';
import { readdir, stat, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createLocalDataPath } from '@/lib/storage/localDataPath';
import { saveUploadedFile, getUploadFilePath } from '@/lib/upload/saveFile';
import { apiResponse, apiError } from '@/lib/response';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

interface UploadEntry {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

export const uploadRoutes = new Hono();

// POST /api/upload — multipart file upload
uploadRoutes.post('/upload', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      return c.json({ error: '请选择要上传的文件' }, 400);
    }
    const { url, filename } = await saveUploadedFile(file);
    return c.json({ url, filename });
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    const isClientError =
      message.includes('大小') ||
      message.includes('格式') ||
      message.includes('类型') ||
      message.includes('不支持');
    return c.json({ error: message }, isClientError ? 400 : 500);
  }
});

// GET /api/uploads — list uploaded images
uploadRoutes.get('/uploads', async (c) => {
  try {
    const dir = createLocalDataPath('uploads');
    let files: string[];
    try {
      files = await readdir(dir);
    } catch {
      return apiResponse(c, { uploads: [] });
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
    return apiResponse(c, { uploads: entries });
  } catch (error) {
    return apiError(c, error instanceof Error ? error.message : '读取上传列表失败', 500);
  }
});

// GET /api/uploads/:filename — serve a stored image
uploadRoutes.get('/uploads/:filename', async (c) => {
  try {
    const filename = c.req.param('filename');
    const filepath = getUploadFilePath(filename);

    let buffer: Uint8Array;
    try {
      buffer = await readFile(filepath);
    } catch {
      return c.json({ error: '文件不存在' }, 404);
    }

    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    const contentType = CONTENT_TYPES[ext || ''] || 'application/octet-stream';

    return c.body(new Uint8Array(buffer), 200, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
  } catch (error) {
    return c.json({ error: error instanceof Error ? error.message : '读取文件失败' }, 400);
  }
});
