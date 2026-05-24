import { NextRequest } from 'next/server';
import { getDraftRegistry } from '@/lib/drafts/registry';
import type { DraftSource } from '@/lib/drafts/types';
import { validateTitle, validateContent } from '@/lib/validation';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

const VALID_SOURCES: DraftSource[] = ['manual', 'ai-news', 'import'];

function isDraftSource(value: unknown): value is DraftSource {
  return typeof value === 'string' && VALID_SOURCES.includes(value as DraftSource);
}

export async function GET() {
  const drafts = getDraftRegistry().listDrafts();
  return apiResponse({ drafts });
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
    const topicId =
      typeof body.topicId === 'string' && body.topicId.trim() ? body.topicId.trim() : undefined;
    const briefId =
      typeof body.briefId === 'string' && body.briefId.trim() ? body.briefId.trim() : undefined;
    const contentGoal =
      typeof body.contentGoal === 'string' && body.contentGoal.trim()
        ? body.contentGoal.trim()
        : undefined;
    const scheduledAt =
      typeof body.scheduledAt === 'string' && body.scheduledAt.trim()
        ? body.scheduledAt.trim()
        : undefined;
    const platforms = Array.isArray(body.platforms) ? body.platforms : undefined;
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

    if (!title || !content) {
      return apiError('标题和内容不能为空');
    }

    const titleErr = validateTitle(title);
    if (titleErr) return apiError(titleErr);
    const contentErr = validateContent(content);
    if (contentErr) return apiError(contentErr);

    const draft = getDraftRegistry().createDraft({
      title,
      content,
      source,
      topicClusterId,
      topicId,
      briefId,
      contentGoal,
      scheduledAt,
      platforms,
      tags,
    });

    return apiResponse({ draft }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建稿件失败', 500);
  }
}
