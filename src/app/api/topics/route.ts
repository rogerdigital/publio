import { NextRequest } from 'next/server';
import { getTopicRegistry } from '@/lib/topics/registry';
import type { TopicStatus } from '@/lib/topics/types';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

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

export async function GET(request: NextRequest | Request) {
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const tag = url.searchParams.get('tag');
  const q = url.searchParams.get('q');

  if (status && !isTopicStatus(status)) {
    return apiError('无效的 status 参数', 400);
  }

  const topics = getTopicRegistry().listTopics({
    ...(status ? { status: status as TopicStatus } : {}),
    ...(tag ? { tag } : {}),
    ...(q ? { q } : {}),
  });

  return apiResponse({ topics });
}

export async function POST(request: NextRequest | Request) {
  try {
    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return apiError('标题不能为空', 400);
    }

    const angle = typeof body.angle === 'string' ? body.angle.trim() : undefined;
    const summary = typeof body.summary === 'string' ? body.summary.trim() : undefined;
    const signalIds = Array.isArray(body.signalIds)
      ? body.signalIds.filter((id: unknown) => typeof id === 'string')
      : undefined;
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((t: unknown) => typeof t === 'string').slice(0, 20)
      : undefined;
    const targetAudience =
      typeof body.targetAudience === 'string' && body.targetAudience.trim()
        ? body.targetAudience.trim()
        : undefined;
    const recommendedPlatforms = Array.isArray(body.recommendedPlatforms)
      ? body.recommendedPlatforms.filter((p: unknown) => typeof p === 'string')
      : undefined;
    const writingValue = typeof body.writingValue === 'number' ? body.writingValue : undefined;
    const urgency = typeof body.urgency === 'number' ? body.urgency : undefined;

    const topic = getTopicRegistry().createTopic({
      title,
      angle,
      summary,
      signalIds,
      tags,
      targetAudience,
      recommendedPlatforms,
      writingValue,
      urgency,
    });

    return apiResponse({ topic }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建选题失败', 500);
  }
}
