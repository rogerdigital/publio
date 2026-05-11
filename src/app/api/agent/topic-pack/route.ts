import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildTopicPackMessages } from '@/lib/agent/prompts/topicPack';
import type { TopicPackInput } from '@/lib/agent/prompts/topicPack';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: TopicPackInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  if (!body.topic?.title) {
    return Response.json({ error: '缺少选题标题' }, { status: 400 });
  }

  const messages = buildTopicPackMessages({
    topic: body.topic,
    signals: body.signals?.slice(0, 10),
  });

  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, maxTokens: 3000 });

  return createSSEResponse(tokens, request.signal);
}
