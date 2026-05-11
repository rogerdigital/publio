import { NextRequest } from 'next/server';
import { getFeedbackStore } from '@/lib/feedback/store';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest | Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const store = getFeedbackStore();
  const feedback = store.getFeedback(id);
  if (!feedback) return apiError('复盘记录不存在', 404);
  return apiResponse({ feedback });
}

export async function PATCH(
  request: NextRequest | Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const store = getFeedbackStore();
    const updated = store.updateFeedback(id, {
      summary: typeof body.summary === 'string' ? body.summary : undefined,
      learnings: Array.isArray(body.learnings) ? body.learnings : undefined,
      nextActions: Array.isArray(body.nextActions) ? body.nextActions : undefined,
    });
    if (!updated) return apiError('复盘记录不存在', 404);
    return apiResponse({ feedback: updated });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新复盘失败', 500);
  }
}
