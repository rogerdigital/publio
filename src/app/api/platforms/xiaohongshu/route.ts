import { NextRequest, NextResponse } from 'next/server';
import { markdownToHtml } from '@/lib/markdown';
import { XiaohongshuPublisher } from '@/lib/publishers/xiaohongshu';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, content } = body;

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
  }

  const publisher = new XiaohongshuPublisher();
  const result = await publisher.publish({
    title,
    markdownContent: content,
    htmlContent: markdownToHtml(content),
  });

  return NextResponse.json(result);
}
