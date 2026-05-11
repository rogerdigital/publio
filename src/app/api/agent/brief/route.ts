import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildBriefAgentMessages } from '@/lib/agent/prompts/brief';
import type { BriefAgentInput } from '@/lib/agent/prompts/brief';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = ['generate', 'rewrite-thesis', 'fill-outline', 'platform-plan'];

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: BriefAgentInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  if (!body.action || !VALID_ACTIONS.includes(body.action)) {
    return Response.json({ error: '无效的 action' }, { status: 400 });
  }

  const messages = buildBriefAgentMessages(body);
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, maxTokens: 2000 });

  return createSSEResponse(tokens, request.signal);
}
