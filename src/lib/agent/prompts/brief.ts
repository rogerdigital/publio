import type { ChatMessage } from '../types';

export type BriefAction = 'generate' | 'rewrite-thesis' | 'fill-outline' | 'platform-plan';

const BRIEF_SYSTEM_PROMPTS: Record<BriefAction, string> = {
  generate: `你是内容策略助手。根据选题信息生成完整的写作 Brief。

输出严格 JSON，字段如下：
{
  "workingTitle": "工作标题",
  "thesis": "核心观点（1-2句话）",
  "audience": "目标读者画像",
  "tone": "推荐语气",
  "outline": [
    { "heading": "小节标题", "purpose": "该节的写作目标" }
  ],
  "sourceLinks": [
    { "title": "来源标题", "url": "链接" }
  ],
  "platformPlan": [
    { "platform": "平台名", "intent": "发布意图", "estimatedLength": 数字 }
  ]
}

要求：
- outline 至少 3 个小节
- platformPlan 针对推荐平台
- 只输出 JSON`,

  'rewrite-thesis': `你是文字策略顾问。根据现有 Brief 上下文，重新拟定核心观点。

输出格式（严格 JSON）：
{
  "thesis": "新的核心观点",
  "reasoning": "改写理由（一句话）"
}

要求：保持与选题方向一致，更尖锐或更具辨识度。只输出 JSON。`,

  'fill-outline': `你是内容结构专家。根据现有 Brief 信息，补全或优化大纲。

输出格式（严格 JSON）：
{
  "outline": [
    { "heading": "小节标题", "purpose": "该节的写作目标" }
  ],
  "reasoning": "结构设计理由（一句话）"
}

要求：至少 4 节，逻辑清晰，有层次递进。只输出 JSON。`,

  'platform-plan': `你是多平台内容运营专家。根据 Brief 信息，生成各渠道的发布计划。

输出格式（严格 JSON）：
{
  "platformPlan": [
    { "platform": "平台名", "intent": "发布意图和角度", "estimatedLength": 目标字数 }
  ],
  "reasoning": "渠道策略理由（一句话）"
}

平台选项：wechat（公众号）、xiaohongshu（小红书）、zhihu（知乎）、x（X/Twitter）
要求：每个平台有不同的定位和策略。只输出 JSON。`,
};

export interface BriefAgentInput {
  action: BriefAction;
  topic?: {
    title: string;
    angle?: string;
    summary?: string;
    targetAudience?: string;
    tags?: string[];
    recommendedPlatforms?: string[];
  };
  currentBrief?: {
    workingTitle?: string;
    thesis?: string;
    audience?: string;
    tone?: string;
    outline?: Array<{ heading: string; purpose: string }>;
  };
  signals?: Array<{
    title: string;
    summary: string;
    url?: string;
  }>;
}

export function buildBriefAgentMessages(input: BriefAgentInput): ChatMessage[] {
  const systemPrompt = BRIEF_SYSTEM_PROMPTS[input.action];

  let userContent = '';

  if (input.topic) {
    userContent += `选题：${input.topic.title}`;
    if (input.topic.angle) userContent += `\n角度：${input.topic.angle}`;
    if (input.topic.summary) userContent += `\n摘要：${input.topic.summary}`;
    if (input.topic.targetAudience) userContent += `\n目标读者：${input.topic.targetAudience}`;
    if (input.topic.tags?.length) userContent += `\n标签：${input.topic.tags.join(', ')}`;
    if (input.topic.recommendedPlatforms?.length)
      userContent += `\n推荐平台：${input.topic.recommendedPlatforms.join(', ')}`;
  }

  if (input.currentBrief) {
    userContent += '\n\n当前 Brief：';
    if (input.currentBrief.workingTitle)
      userContent += `\n标题：${input.currentBrief.workingTitle}`;
    if (input.currentBrief.thesis) userContent += `\n核心观点：${input.currentBrief.thesis}`;
    if (input.currentBrief.audience) userContent += `\n读者：${input.currentBrief.audience}`;
    if (input.currentBrief.tone) userContent += `\n语气：${input.currentBrief.tone}`;
    if (input.currentBrief.outline?.length) {
      userContent += `\n大纲：\n${input.currentBrief.outline.map((o) => `- ${o.heading}: ${o.purpose}`).join('\n')}`;
    }
  }

  if (input.signals?.length) {
    userContent += '\n\n相关资讯：\n';
    userContent += input.signals
      .slice(0, 8)
      .map((s, i) => `${i + 1}. ${s.title}${s.url ? ` (${s.url})` : ''}\n   ${s.summary}`)
      .join('\n\n');
  }

  return [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userContent },
  ];
}
