import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildDiagnoseMessages } from '@/lib/agent/prompts/diagnose';
import type { DiagnoseAgentRequest } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json(
      { error: 'Agent 未配置' },
      { status: 503 }
    );
  }

  let body: DiagnoseAgentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { platform, errorMessage, statusCode, context } = body;

  if (!platform || !errorMessage?.trim()) {
    return Response.json({ error: '平台和错误信息不能为空' }, { status: 400 });
  }

  const messages = buildDiagnoseMessages(platform, errorMessage, statusCode, context);
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, maxTokens: 1000 });

  return createSSEResponse(tokens, request.signal);
}
