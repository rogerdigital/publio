import { NextRequest } from 'next/server';
import { getBriefRegistry } from '@/lib/briefs/registry';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest | Request) {
  const url = new URL(request.url);
  const topicId = url.searchParams.get('topicId');

  const briefs = getBriefRegistry().listBriefs({
    ...(topicId ? { topicId } : {}),
  });

  return apiResponse({ briefs });
}

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();

    const topicId = typeof body.topicId === 'string' ? body.topicId.trim() : '';
    if (!topicId) {
      return apiError('topicId 不能为空', 400);
    }

    const workingTitle =
      typeof body.workingTitle === 'string' ? body.workingTitle.trim() : undefined;
    const thesis = typeof body.thesis === 'string' ? body.thesis.trim() : undefined;
    const audience = typeof body.audience === 'string' ? body.audience.trim() : undefined;
    const tone = typeof body.tone === 'string' ? body.tone.trim() : undefined;
    const outline = Array.isArray(body.outline) ? body.outline : undefined;
    const sourceLinks = Array.isArray(body.sourceLinks) ? body.sourceLinks : undefined;
    const platformPlan = Array.isArray(body.platformPlan) ? body.platformPlan : undefined;

    const brief = getBriefRegistry().createBrief({
      topicId,
      workingTitle,
      thesis,
      audience,
      tone,
      outline,
      sourceLinks,
      platformPlan,
    });

    return apiResponse({ brief }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建 Brief 失败', 500);
  }
}
