import { NextRequest, NextResponse } from 'next/server';
import { getDraftRegistry } from '@/lib/drafts/registry';
import type { DraftSource } from '@/lib/drafts/types';

export const dynamic = 'force-dynamic';

const VALID_SOURCES: DraftSource[] = ['manual', 'ai-news', 'import'];

function isDraftSource(value: unknown): value is DraftSource {
  return typeof value === 'string' && VALID_SOURCES.includes(value as DraftSource);
}

export async function GET() {
  const drafts = getDraftRegistry().listDrafts();
  return NextResponse.json({ drafts });
}

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    const content = typeof body.content === 'string' ? body.content.trim() : '';
    const source = isDraftSource(body.source) ? body.source : 'manual';
    const topicClusterId =
      typeof body.topicClusterId === 'string' && body.topicClusterId.trim()
        ? body.topicClusterId.trim()
        : undefined;

    if (!title || !content) {
      return NextResponse.json({ error: '标题和内容不能为空' }, { status: 400 });
    }

    const draft = getDraftRegistry().createDraft({
      title,
      content,
      source,
      topicClusterId,
    });

    return NextResponse.json({ draft }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '创建稿件失败' },
      { status: 500 },
    );
  }
}
