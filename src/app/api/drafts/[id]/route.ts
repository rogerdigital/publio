import { NextRequest } from 'next/server';
import { getDraftRegistry } from '@/lib/drafts/registry';
import type { DraftStatus } from '@/lib/drafts/types';
import { validateTitle, validateContent } from '@/lib/validation';
import { apiResponse, apiError } from '@/lib/api/response';

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
  return apiError('稿件不存在', 404);
}

export async function GET(_request: NextRequest | Request, { params }: DraftRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().getDraft(id);
  if (!draft) return missingDraftResponse();
  return apiResponse({ draft });
}

export async function PATCH(request: NextRequest | Request, { params }: DraftRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Record<string, unknown> = {};
    if (typeof body.title === 'string') {
      const err = validateTitle(body.title);
      if (err) return apiError(err);
      input.title = body.title.trim();
    }
    if (typeof body.content === 'string') {
      const err = validateContent(body.content);
      if (err) return apiError(err);
      input.content = body.content.trim();
    }
    if (isDraftStatus(body.status)) {
      input.status = body.status;
    }

    const draft = getDraftRegistry().updateDraft(id, input as any);
    if (!draft) return missingDraftResponse();

    return apiResponse({ draft });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新稿件失败', 500);
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: DraftRouteContext) {
  const { id } = await params;
  const draft = getDraftRegistry().archiveDraft(id);
  if (!draft) return missingDraftResponse();
  return apiResponse({ draft });
}
