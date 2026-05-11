import { NextRequest } from 'next/server';
import { getTopicRegistry } from '@/lib/topics/registry';
import type { TopicStatus } from '@/lib/topics/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface TopicRouteContext {
  params: Promise<{ id: string }>;
}

const VALID_STATUSES: TopicStatus[] = [
  'idea',
  'researching',
  'briefed',
  'drafting',
  'published',
  'archived',
];

function isTopicStatus(value: unknown): value is TopicStatus {
  return typeof value === 'string' && VALID_STATUSES.includes(value as TopicStatus);
}

export async function GET(_request: NextRequest | Request, { params }: TopicRouteContext) {
  const { id } = await params;
  const topic = getTopicRegistry().getTopic(id);
  if (!topic) return apiError('选题不存在', 404);
  return apiResponse({ topic });
}

export async function PATCH(request: NextRequest | Request, { params }: TopicRouteContext) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input: Record<string, unknown> = {};

    if (typeof body.title === 'string' && body.title.trim()) {
      input.title = body.title.trim();
    }
    if (typeof body.angle === 'string') {
      input.angle = body.angle.trim();
    }
    if (typeof body.summary === 'string') {
      input.summary = body.summary.trim();
    }
    if (body.status !== undefined) {
      if (!isTopicStatus(body.status)) {
        return apiError('无效的 status 值', 400);
      }
      input.status = body.status;
    }
    if (Array.isArray(body.tags)) {
      input.tags = body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20);
    }
    if (typeof body.targetAudience === 'string') {
      input.targetAudience = body.targetAudience.trim();
    }
    if (Array.isArray(body.recommendedPlatforms)) {
      input.recommendedPlatforms = body.recommendedPlatforms.filter(
        (p: unknown) => typeof p === 'string',
      );
    }
    if (typeof body.writingValue === 'number') {
      input.writingValue = body.writingValue;
    }
    if (typeof body.urgency === 'number') {
      input.urgency = body.urgency;
    }

    const topic = getTopicRegistry().updateTopic(id, input as any);
    if (!topic) return apiError('选题不存在或状态转换不合法', 404);

    return apiResponse({ topic });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '更新选题失败', 500);
  }
}

export async function DELETE(_request: NextRequest | Request, { params }: TopicRouteContext) {
  const { id } = await params;
  const topic = getTopicRegistry().archiveTopic(id);
  if (!topic) return apiError('选题不存在', 404);
  return apiResponse({ topic });
}
