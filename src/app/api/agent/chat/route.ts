import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import {
  AGENT_INPUT_LIMITS,
  limitChatMessages,
  limitText,
  markTruncated,
} from '@/lib/agent/inputLimits';
import type { ChatMessage } from '@/lib/agent/types';

export const dynamic = 'force-dynamic';

const SYSTEM_PROMPT = `你是一个专业的内容写作助手。用户正在撰写一篇多平台发布的文章。
你的职责是：
- 根据用户的问题提供建议、修改意见或补充内容
- 输出适合直接使用的 Markdown 格式文本
- 回答简洁、专业、有建设性
- 如果用户要求生成内容，直接输出可用的 Markdown，不要额外解释`;

interface ChatRequest {
  messages: ChatMessage[];
  context?: {
    title?: string;
    content?: string;
  };
}

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json(
      { error: 'Agent 未配置，请在设置中填写 AGENT_BASE_URL、AGENT_API_KEY、AGENT_MODEL' },
      { status: 503 },
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { messages, context } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: '消息不能为空' }, { status: 400 });
  }

  const limitedMessages = limitChatMessages(messages);
  // 构建带上下文的系统消息
  let systemPrompt = SYSTEM_PROMPT;
  let contextTruncated = false;
  if (context?.title || context?.content) {
    systemPrompt += '\n\n当前文章上下文：';
    if (context.title) {
      const limitedTitle = limitText(context.title, AGENT_INPUT_LIMITS.titleChars);
      contextTruncated = contextTruncated || limitedTitle.truncated;
      systemPrompt += `\n标题：${limitedTitle.value}`;
    }
    if (context.content) {
      const limitedContent = limitText(context.content, AGENT_INPUT_LIMITS.contentChars);
      contextTruncated = contextTruncated || limitedContent.truncated;
      systemPrompt += `\n内容：\n${limitedContent.value}`;
    }
  }

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...limitedMessages.value,
  ];

  const provider = createLLMProvider(config, config.provider);
  const tokens = provider.stream({ messages: fullMessages });

  return markTruncated(
    createSSEResponse(tokens, request.signal),
    limitedMessages.truncated || contextTruncated,
  );
}
