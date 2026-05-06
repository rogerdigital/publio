import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildAdaptationMessages } from '@/lib/agent/prompts/adaptation';
import type { AdaptAgentRequest } from '@/lib/agent/types';
import { PLATFORMS } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json(
      { error: 'Agent 未配置' },
      { status: 503 }
    );
  }

  let body: AdaptAgentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { title, content, platform } = body;

  if (!platform || !PLATFORMS.some((p) => p.id === platform)) {
    return Response.json({ error: '无效的平台 ID' }, { status: 400 });
  }

  if (!content?.trim()) {
    return Response.json({ error: '内容不能为空' }, { status: 400 });
  }

  const messages = buildAdaptationMessages(platform, title || '', content);
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages });

  return createSSEResponse(tokens, request.signal);
}
