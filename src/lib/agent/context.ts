import { getBriefRegistry } from '@/lib/briefs/registry';
import { getTopicRegistry } from '@/lib/topics/registry';
import type { Brief } from '@/lib/briefs/types';

const CONTEXT_CHAR_LIMIT = 2000;

export interface WritingAgentContext {
  thesis?: string;
  audience?: string;
  tone?: string;
  outline?: string;
  sources?: string;
  topicTitle?: string;
}

export interface BuildContextInput {
  draftId?: string | null;
  topicId?: string | null;
  briefId?: string | null;
}

export function buildWritingAgentContext(input: BuildContextInput): WritingAgentContext | null {
  const briefId = input.briefId;
  const topicId = input.topicId;

  let brief: Brief | null = null;

  if (briefId) {
    brief = getBriefRegistry().getBrief(briefId);
  } else if (topicId) {
    brief = getBriefRegistry().getBriefByTopicId(topicId);
  }

  if (!brief) return null;

  const topic = topicId ? getTopicRegistry().getTopic(topicId) : null;
  const ctx: WritingAgentContext = {};

  if (topic) ctx.topicTitle = topic.title;
  if (brief.thesis) ctx.thesis = brief.thesis;
  if (brief.audience) ctx.audience = brief.audience;
  if (brief.tone) ctx.tone = brief.tone;

  if (brief.outline.length > 0) {
    ctx.outline = brief.outline
      .map((item) => `- ${item.heading}${item.purpose ? `（${item.purpose}）` : ''}`)
      .join('\n');
  }

  if (brief.sourceLinks.length > 0) {
    ctx.sources = brief.sourceLinks
      .slice(0, 5)
      .map((link) => `- ${link.title}${link.url ? ` (${link.url})` : ''}`)
      .join('\n');
  }

  return ctx;
}

export function formatContextForPrompt(ctx: WritingAgentContext): string {
  const parts: string[] = [];

  if (ctx.topicTitle) parts.push(`选题：${ctx.topicTitle}`);
  if (ctx.thesis) parts.push(`核心观点：${ctx.thesis}`);
  if (ctx.audience) parts.push(`目标读者：${ctx.audience}`);
  if (ctx.tone) parts.push(`语气：${ctx.tone}`);
  if (ctx.outline) parts.push(`大纲：\n${ctx.outline}`);
  if (ctx.sources) parts.push(`参考来源：\n${ctx.sources}`);

  let result = parts.join('\n\n');

  if (result.length > CONTEXT_CHAR_LIMIT) {
    const priorityParts: string[] = [];
    if (ctx.thesis) priorityParts.push(`核心观点：${ctx.thesis}`);
    if (ctx.audience) priorityParts.push(`目标读者：${ctx.audience}`);
    if (ctx.outline) priorityParts.push(`大纲：\n${ctx.outline}`);
    result = priorityParts.join('\n\n').slice(0, CONTEXT_CHAR_LIMIT);
  }

  return result;
}
