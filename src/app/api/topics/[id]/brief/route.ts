import { NextRequest } from 'next/server';
import { getTopicRegistry } from '@/lib/topics/registry';
import { getBriefRegistry } from '@/lib/briefs/registry';
import { getSignalRegistry } from '@/lib/signals/registry';
import { apiResponse, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

interface TopicBriefRouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest | Request, { params }: TopicBriefRouteContext) {
  const { id } = await params;

  const topic = getTopicRegistry().getTopic(id);
  if (!topic) return apiError('选题不存在', 404);

  const brief = getBriefRegistry().getBriefByTopicId(id);
  if (!brief) return apiError('该选题尚未创建 Brief', 404);

  return apiResponse({ brief });
}

export async function POST(_request: NextRequest | Request, { params }: TopicBriefRouteContext) {
  try {
    const { id } = await params;

    const topic = getTopicRegistry().getTopic(id);
    if (!topic) return apiError('选题不存在', 404);

    const existing = getBriefRegistry().getBriefByTopicId(id);
    if (existing) {
      return apiResponse({ brief: existing, created: false });
    }

    const signalRegistry = getSignalRegistry();
    const sourceLinks = topic.signalIds
      .map((sid) => {
        const signal = signalRegistry.getSignal(sid);
        if (!signal) return null;
        return { title: signal.title, url: signal.url || '', signalId: signal.id };
      })
      .filter((link): link is NonNullable<typeof link> => link !== null);

    const brief = getBriefRegistry().createBrief({
      topicId: id,
      workingTitle: topic.title,
      thesis: topic.angle || '',
      audience: topic.targetAudience || '',
      tone: '',
      outline: [],
      sourceLinks,
      platformPlan: topic.recommendedPlatforms.map((p) => ({
        platform: p,
        intent: '',
        estimatedLength: 0,
      })),
    });

    getTopicRegistry().updateTopic(id, { status: 'briefed' });

    return apiResponse({ brief, created: true }, 201);
  } catch (error) {
    return apiError(error instanceof Error ? error.message : '创建 Brief 失败', 500);
  }
}
