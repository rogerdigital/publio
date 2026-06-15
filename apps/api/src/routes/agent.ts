import { Hono } from 'hono';
import { getAgentConfig } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { AGENT_INPUT_LIMITS, limitText, markTruncated } from '@/lib/agent/inputLimits';
import { buildWritingMessages } from '@/lib/agent/prompts/writing';
import { buildAdaptationMessages } from '@/lib/agent/prompts/adaptation';
import type { WritingAction, WritingAgentRequest, AdaptAgentRequest } from '@/lib/agent/types';
import { PLATFORMS } from '@/types';

const VALID_ACTIONS: WritingAction[] = ['rewrite', 'title'];

export const agentRoutes = new Hono();

agentRoutes.get('/status', (c) => {
  try {
    const config = getAgentConfig();
    if (!config) return c.json({ available: false });
    return c.json({ available: true, provider: config.provider, model: config.model });
  } catch {
    return c.json({ available: false });
  }
});

agentRoutes.post('/write', async (c) => {
  const config = getAgentConfig();
  if (!config) {
    return c.json(
      { error: 'Agent 未配置，请在设置中填写 AGENT_BASE_URL、AGENT_API_KEY、AGENT_MODEL' },
      503,
    );
  }

  let body: WritingAgentRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '请求体解析失败' }, 400);
  }

  const { action, content, title, selection } = body;
  if (!action || !VALID_ACTIONS.includes(action)) {
    return c.json({ error: `无效的 action，可选: ${VALID_ACTIONS.join(', ')}` }, 400);
  }
  if (!content?.trim()) {
    return c.json({ error: '内容不能为空' }, 400);
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
    createSSEResponse(tokens, c.req.raw.signal),
    limitedContent.truncated || limitedTitle.truncated || limitedSelection.truncated,
  );
});

agentRoutes.post('/adapt', async (c) => {
  const config = getAgentConfig();
  if (!config) return c.json({ error: 'Agent 未配置' }, 503);

  let body: AdaptAgentRequest;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: '请求体解析失败' }, 400);
  }

  const { title, content, platform, customPrompt } = body;
  if (!platform || !PLATFORMS.some((p) => p.id === platform)) {
    return c.json({ error: '无效的平台 ID' }, 400);
  }
  if (!content?.trim()) {
    return c.json({ error: '内容不能为空' }, 400);
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
  const provider = createLLMProvider(config, config.provider);
  const tokens = provider.stream({ messages });

  return markTruncated(
    createSSEResponse(tokens, c.req.raw.signal),
    limitedTitle.truncated || limitedContent.truncated || limitedCustomPrompt.truncated,
  );
});
