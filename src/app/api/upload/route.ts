import { NextRequest, NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/upload/saveFile';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: '请选择要上传的文件' }, { status: 400 });
    }

    const { url, filename } = await saveUploadedFile(file);
    return NextResponse.json({ url, filename });
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
