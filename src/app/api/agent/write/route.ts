import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { AGENT_INPUT_LIMITS, limitText, markTruncated } from '@/lib/agent/inputLimits';
import { buildWritingMessages } from '@/lib/agent/prompts/writing';
import type { WritingAction, WritingAgentRequest } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS: WritingAction[] = ['rewrite', 'title'];

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json(
      { error: 'Agent 未配置，请在设置中填写 AGENT_BASE_URL、AGENT_API_KEY、AGENT_MODEL' },
      { status: 503 },
    );
  }

  let body: WritingAgentRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { action, content, title, selection } = body;

  if (!action || !VALID_ACTIONS.includes(action)) {
    return Response.json(
      { error: `无效的 action，可选: ${VALID_ACTIONS.join(', ')}` },
      { status: 400 },
    );
  }

  if (!content?.trim()) {
    return Response.json({ error: '内容不能为空' }, { status: 400 });
  }

  const limitedContent = limitText(content, AGENT_INPUT_LIMITS.contentChars);
  const limitedTitle = limitText(title, AGENT_INPUT_LIMITS.titleChars);
  const limitedSelection = limitText(selection, AGENT_INPUT_LIMITS.selectionChars);

  const messages = buildWritingMessages(action, limitedContent.value, {
    title: limitedTitle.value,
    selection: limitedSelection.value,
  });
  const provider = createLLMProvider(config, config.provider);
  const tokens = provider.stream({ messages });

  return markTruncated(
    createSSEResponse(tokens, request.signal),
    limitedContent.truncated || limitedTitle.truncated || limitedSelection.truncated,
  );
}
