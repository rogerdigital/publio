import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { getBrandProfile } from '@/lib/copilot/profile';
import { buildRecommendPrompt } from '@/lib/copilot/recommend';
import type { AiNewsCluster } from '@/lib/ai-news/types';
import type { ChatMessage } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  const profile = getBrandProfile();
  if (!profile) {
    return Response.json({ error: '请先配置品牌画像' }, { status: 400 });
  }

  let body: { clusters: AiNewsCluster[] };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  if (!body.clusters?.length) {
    return Response.json({ error: '没有可用的新闻话题' }, { status: 400 });
  }

  const prompt = buildRecommendPrompt(profile, body.clusters);
  const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, temperature: 0.7 });

  return createSSEResponse(tokens, request.signal);
}
