import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildResearchMessages } from '@/lib/agent/prompts/research';
import type { ResearchAgentRequest } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json(
      { error: 'Agent 未配置' },
      { status: 503 }
    );
  }

  let body: ResearchAgentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { clusterTitle, signals } = body;

  if (!clusterTitle?.trim()) {
    return Response.json({ error: '话题标题不能为空' }, { status: 400 });
  }

  if (!signals || signals.length === 0) {
    return Response.json({ error: '至少需要一条信号' }, { status: 400 });
  }

  const messages = buildResearchMessages(clusterTitle, signals);
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, maxTokens: 3000 });

  return createSSEResponse(tokens, request.signal);
}
