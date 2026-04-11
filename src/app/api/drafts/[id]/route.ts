import { NextRequest, NextResponse } from 'next/server';
import { getDraftRegistry } from '@/lib/drafts/registry';
import type { DraftStatus } from '@/lib/drafts/types';

export const dynamic = 'force-dynamic';

interface DraftRouteContext {
  params: Promise<{
    id: string;
  }>;
}

const VALID_STATUSES: DraftStatus[] = [
  'draft',
  'ready',
  'syncing',
  'synced',
  'failed',
  'archived',
];

function isDraftStatus(value: unknown): value is DraftStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as DraftStatus);
}

function missingDraftResponse() {
  return NextResponse.json({ error: '稿件不存在' }, { status: 404 });
}

export async function GET(_request: NextRequest | Request, { params }: DraftRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().getDraft(id);
  if (!draft) return missingDraftResponse();
  return NextResponse.json({ draft });
}

export async function PATCH(request: NextRequest | Request, { params }: DraftRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = {
      ...(typeof body.title === 'string' ? { title: body.title.trim() } : {}),
      ...(typeof body.content === 'string' ? { content: body.content.trim() } : {}),
      ...(isDraftStatus(body.status) ? { status: body.status } : {}),
    };

    const draft = getDraftRegistry().updateDraft(id, input);
    if (!draft) return missingDraftResponse();

    return NextResponse.json({ draft });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '更新稿件失败' },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: DraftRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().archiveDraft(id);
  if (!draft) return missingDraftResponse();
  return NextResponse.json({ draft });
}
