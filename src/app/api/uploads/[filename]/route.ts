import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'node:fs/promises';
import { getUploadFilePath } from '@/lib/upload/saveFile';

const CONTENT_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;
    const filepath = getUploadFilePath(filename);

    let buffer: Uint8Array;
    try {
      buffer = await readFile(filepath);
    } catch {
      return NextResponse.json({ error: '文件不存在' }, { status: 404 });
    }

    const ext = '.' + filename.split('.').pop()?.toLowerCase();
    const contentType = CONTENT_TYPES[ext || ''] || 'application/octet-stream';

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '读取文件失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
