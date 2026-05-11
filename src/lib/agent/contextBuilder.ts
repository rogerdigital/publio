import type { PlatformId } from '@/types';
import type { Signal } from '@/lib/signals/types';
import type { Topic } from '@/lib/topics/types';
import type { Brief } from '@/lib/briefs/types';
import type { ContentDraft } from '@/lib/drafts/types';
import type { PlatformVariant } from '@/lib/platformVariants/types';
import type { SyncTask } from '@/lib/sync/types';

export type AgentPhase =
  | 'signal-review'
  | 'topic-research'
  | 'brief-writing'
  | 'draft-writing'
  | 'adaptation'
  | 'publish-check'
  | 'diagnostics';

export interface AgentTaskContext {
  phase: AgentPhase;
  signals?: Pick<Signal, 'id' | 'title' | 'summary' | 'tags'>[];
  topic?: Pick<Topic, 'id' | 'title' | 'angle' | 'summary' | 'targetAudience'>;
  brief?: Pick<Brief, 'id' | 'thesis' | 'audience' | 'tone' | 'outline' | 'sourceLinks'>;
  draft?: Pick<ContentDraft, 'id' | 'title' | 'content' | 'status'>;
  variants?: Pick<PlatformVariant, 'id' | 'platform' | 'title' | 'status'>[];
  publishTask?: Pick<SyncTask, 'id' | 'status' | 'receipts' | 'events'>;
  feedbackSummary?: string;
  userInput?: string;
}

export interface BuildAgentContextInput {
  phase: AgentPhase;
  signals?: Signal[];
  topic?: Topic;
  brief?: Brief;
  draft?: ContentDraft;
  variants?: PlatformVariant[];
  publishTask?: SyncTask;
  feedbackSummary?: string;
  userInput?: string;
}

const MAX_CONTEXT_CHARS = 6000;

const PRIORITY_ORDER: (keyof AgentTaskContext)[] = [
  'userInput',
  'brief',
  'draft',
  'variants',
  'topic',
  'signals',
  'publishTask',
  'feedbackSummary',
];

function estimateLength(value: unknown): number {
  if (!value) return 0;
  return JSON.stringify(value).length;
}

export function buildAgentContext(input: BuildAgentContextInput): AgentTaskContext {
  const ctx: AgentTaskContext = { phase: input.phase };

  if (input.userInput) ctx.userInput = input.userInput;

  if (input.brief) {
    ctx.brief = {
      id: input.brief.id,
      thesis: input.brief.thesis,
      audience: input.brief.audience,
      tone: input.brief.tone,
      outline: input.brief.outline,
      sourceLinks: input.brief.sourceLinks?.slice(0, 5),
    };
  }

  if (input.draft) {
    ctx.draft = {
      id: input.draft.id,
      title: input.draft.title,
      content: input.draft.content,
      status: input.draft.status,
    };
  }

  if (input.variants) {
    ctx.variants = input.variants.map((v) => ({
      id: v.id,
      platform: v.platform,
      title: v.title,
      status: v.status,
    }));
  }

  if (input.topic) {
    ctx.topic = {
      id: input.topic.id,
      title: input.topic.title,
      angle: input.topic.angle,
      summary: input.topic.summary,
      targetAudience: input.topic.targetAudience,
    };
  }

  if (input.signals) {
    ctx.signals = input.signals.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary,
      tags: s.tags,
    }));
  }

  if (input.publishTask) {
    ctx.publishTask = {
      id: input.publishTask.id,
      status: input.publishTask.status,
      receipts: input.publishTask.receipts,
      events: input.publishTask.events,
    };
  }

  if (input.feedbackSummary) ctx.feedbackSummary = input.feedbackSummary;

  return trimContext(ctx);
}

function trimContext(ctx: AgentTaskContext): AgentTaskContext {
  const total = estimateLength(ctx);
  if (total <= MAX_CONTEXT_CHARS) return ctx;

  const trimmed = { ...ctx };

  // First: truncate draft content if it's very long
  if (trimmed.draft?.content && trimmed.draft.content.length > 2000) {
    trimmed.draft = {
      ...trimmed.draft,
      content: trimmed.draft.content.slice(0, 2000) + '…(已截断)',
    };
  }

  if (estimateLength(trimmed) <= MAX_CONTEXT_CHARS) return trimmed;

  // Then: drop low-priority fields from the end
  for (let i = PRIORITY_ORDER.length - 1; i >= 0; i--) {
    if (estimateLength(trimmed) <= MAX_CONTEXT_CHARS) break;
    const key = PRIORITY_ORDER[i];
    if (key === 'phase' || key === 'userInput') continue;
    if (trimmed[key]) {
      delete (trimmed as Record<string, unknown>)[key];
    }
  }

  return trimmed;
}

export function formatAgentContext(ctx: AgentTaskContext): string {
  const sections: string[] = [];

  if (ctx.userInput) sections.push(`用户输入：${ctx.userInput}`);

  if (ctx.topic) {
    sections.push(
      `选题：${ctx.topic.title}${ctx.topic.angle ? `\n角度：${ctx.topic.angle}` : ''}${ctx.topic.targetAudience ? `\n目标读者：${ctx.topic.targetAudience}` : ''}`,
    );
  }

  if (ctx.brief) {
    const parts = [`核心观点：${ctx.brief.thesis || '（待定）'}`];
    if (ctx.brief.audience) parts.push(`读者：${ctx.brief.audience}`);
    if (ctx.brief.tone) parts.push(`语气：${ctx.brief.tone}`);
    if (ctx.brief.outline?.length) {
      parts.push(`大纲：\n${ctx.brief.outline.map((o) => `- ${o.heading}`).join('\n')}`);
    }
    sections.push(parts.join('\n'));
  }

  if (ctx.draft) {
    sections.push(`稿件[${ctx.draft.status}]：${ctx.draft.title}\n${ctx.draft.content}`);
  }

  if (ctx.variants?.length) {
    sections.push(
      `渠道版本：\n${ctx.variants.map((v) => `- ${v.platform}(${v.status}): ${v.title}`).join('\n')}`,
    );
  }

  if (ctx.signals?.length) {
    sections.push(
      `相关信号(${ctx.signals.length})：\n${ctx.signals.map((s) => `- ${s.title}`).join('\n')}`,
    );
  }

  if (ctx.publishTask) {
    const receiptSummary = ctx.publishTask.receipts
      .map((r) => `${r.platform}:${r.status}`)
      .join(', ');
    sections.push(`发布任务[${ctx.publishTask.status}]：${receiptSummary}`);
  }

  if (ctx.feedbackSummary) sections.push(`历史反馈：${ctx.feedbackSummary}`);

  return sections.join('\n\n');
}
