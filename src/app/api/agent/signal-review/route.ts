import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildSignalReviewMessages } from '@/lib/agent/prompts/signalReview';
import type { SignalReviewInput } from '@/lib/agent/prompts/signalReview';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: SignalReviewInput;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  if (!body.signals || body.signals.length === 0) {
    return Response.json({ error: '至少需要一条信号' }, { status: 400 });
  }

  const messages = buildSignalReviewMessages({
    signals: body.signals.slice(0, 30),
    brandProfile: body.brandProfile,
    styleProfile: body.styleProfile,
  });

  const provider = createLLMProvider(config, config.provider);
  const tokens = provider.stream({ messages, maxTokens: 2000 });

  return createSSEResponse(tokens, request.signal);
}
