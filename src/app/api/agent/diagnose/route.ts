import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { AGENT_INPUT_LIMITS, limitText, markTruncated } from '@/lib/agent/inputLimits';
import { buildDiagnoseMessages } from '@/lib/agent/prompts/diagnose';
import type { DiagnoseAgentRequest } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: DiagnoseAgentRequest & {
    events?: Array<{ type: string; message?: string; timestamp: string }>;
    variantSnapshot?: { title?: string; contentLength?: number; status?: string };
    publishCheckResult?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const {
    platform,
    errorMessage,
    statusCode,
    context,
    events,
    variantSnapshot,
    publishCheckResult,
  } = body;

  if (!platform || !errorMessage?.trim()) {
    return Response.json({ error: '平台和错误信息不能为空' }, { status: 400 });
  }

  const limitedErrorMessage = limitText(errorMessage, AGENT_INPUT_LIMITS.signalSummaryChars);
  const limitedContext = limitText(context, AGENT_INPUT_LIMITS.diagnoseContextChars);
  const messages = buildDiagnoseMessages(
    platform,
    limitedErrorMessage.value,
    statusCode,
    limitedContext.value,
    events?.slice(0, 20),
    variantSnapshot,
    publishCheckResult,
  );
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages, maxTokens: 1500 });

  return markTruncated(
    createSSEResponse(tokens, request.signal),
    limitedErrorMessage.truncated || limitedContext.truncated,
  );
}
