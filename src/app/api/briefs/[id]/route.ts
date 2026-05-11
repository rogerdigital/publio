import { NextRequest } from 'next/server';
import { getBriefRegistry } from '@/lib/briefs/registry';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface BriefRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest | Request, { params }: BriefRouteContext) {
  const { id } = await params;
  const brief = getBriefRegistry().getBrief(id);
  if (!brief) return apiError('Brief 不存在', 404);
  return apiResponse({ brief });
}

export async function PATCH(request: NextRequest | Request, { params }: BriefRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Record<string, unknown> = {};

    if (typeof body.workingTitle === 'string') {
      input.workingTitle = body.workingTitle.trim();
    }
    if (typeof body.thesis === 'string') {
      input.thesis = body.thesis.trim();
    }
    if (typeof body.audience === 'string') {
      input.audience = body.audience.trim();
    }
    if (typeof body.tone === 'string') {
      input.tone = body.tone.trim();
    }
    if (Array.isArray(body.outline)) {
      input.outline = body.outline;
    }
    if (Array.isArray(body.sourceLinks)) {
      input.sourceLinks = body.sourceLinks;
    }
    if (Array.isArray(body.platformPlan)) {
      input.platformPlan = body.platformPlan;
    }

    const brief = getBriefRegistry().updateBrief(id, input as any);
    if (!brief) return apiError('Brief 不存在', 404);

    return apiResponse({ brief });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新 Brief 失败', 500);
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: BriefRouteContext) {
  const { id } = await params;
  const deleted = getBriefRegistry().deleteBrief(id);
  if (!deleted) return apiError('Brief 不存在', 404);
  return apiResponse({ deleted: true });
}
