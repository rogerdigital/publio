import { NextRequest } from 'next/server';
import { getAgentConfig } from '@/lib/agent/config';
import { createLLMProvider } from '@/lib/agent/provider';
import { createSSEResponse } from '@/lib/agent/stream';
import { buildFeedbackAgentMessages } from '@/lib/agent/prompts/feedback';
import type { PlatformId } from '@/types';

export const dynamic = 'force-dynamic';

const VALID_PLATFORMS: PlatformId[] = ['wechat', 'xiaohongshu', 'zhihu', 'x'];

export async function POST(request: NextRequest) {
  const config = getAgentConfig();
  if (!config) {
    return Response.json({ error: 'Agent 未配置' }, { status: 503 });
  }

  let body: {
    platform?: string;
    title?: string;
    contentSnippet?: string;
    metrics?: { views: number; likes: number; comments: number; shares: number };
    publishedAt?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: '请求体解析失败' }, { status: 400 });
  }

  const { platform, title, contentSnippet, metrics, publishedAt } = body;

  if (!platform || !VALID_PLATFORMS.includes(platform as PlatformId)) {
    return Response.json({ error: '无效的 platform' }, { status: 400 });
  }
  if (!title?.trim()) {
    return Response.json({ error: '标题不能为空' }, { status: 400 });
  }

  const messages = buildFeedbackAgentMessages({
    platform: platform as PlatformId,
    title: title.trim(),
    contentSnippet: contentSnippet?.slice(0, 500),
    metrics,
    publishedAt,
  });

  const provider = createLLMProvider(config, config.provider);
  const tokens = provider.stream({ messages, maxTokens: 1500 });

  return createSSEResponse(tokens, request.signal);
}
