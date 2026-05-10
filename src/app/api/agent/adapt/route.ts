import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createOpenAIProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { AGENT_INPUT_LIMITS, limitText, markTruncated } from '@/lib/agent/inputLimits';
import { buildAdaptationMessages } from '@/lib/agent/prompts/adaptation';
import type { AdaptAgentRequest } from '@/lib/agent/types';
import { PLATFORMS } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: AdaptAgentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { title, content, platform, customPrompt } = body;

  if (!platform || !PLATFORMS.some((p) => p.id === platform)) {
    return Response.json({ error: '无效的平台 ID' }, { status: 400 });
  }

  if (!content?.trim()) {
    return Response.json({ error: '内容不能为空' }, { status: 400 });
  }

  const limitedTitle = limitText(title, AGENT_INPUT_LIMITS.titleChars);
  const limitedContent = limitText(content, AGENT_INPUT_LIMITS.contentChars);
  const limitedCustomPrompt = limitText(customPrompt, AGENT_INPUT_LIMITS.customPromptChars);
  const messages = buildAdaptationMessages(
    platform,
    limitedTitle.value,
    limitedContent.value,
    limitedCustomPrompt.value,
  );
  const provider = createOpenAIProvider(config);
  const tokens = provider.stream({ messages });

  return markTruncated(
    createSSEResponse(tokens, request.signal),
    limitedTitle.truncated || limitedContent.truncated || limitedCustomPrompt.truncated,
  );
}
