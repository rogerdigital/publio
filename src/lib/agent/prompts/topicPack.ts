import type { ChatMessage } from '../types';

const TOPIC_PACK_SYSTEM_PROMPT = `你是一位内容策略专家，为创作者生成结构化「写作包」。

写作包是创作者开始动笔前的最后一份参考材料，需同时兼顾深度和可操作性。

输出格式（严格 JSON，不要 Markdown）：

{
  "backgroundSummary": "3-5 句话的事件背景摘要",
  "coreFacts": ["关键事实 1", "关键事实 2", ...],
  "angles": [
    { "title": "角度标题", "description": "1-2 句说明为什么这个角度有价值" }
  ],
  "targetAudience": "建议的目标读者描述",
  "counterArguments": ["反方观点/质疑 1", "反方观点/质疑 2"],
  "structureSuggestion": {
    "format": "推荐格式（如深度分析/观点评论/盘点/实操指南）",
    "outline": ["结构建议 1", "结构建议 2", ...]
  },
  "platformAdvice": [
    { "platform": "平台名", "advice": "针对该平台的内容建议" }
  ],
  "sourceLinks": [
    { "title": "来源标题", "url": "来源链接" }
  ]
}

要求：
- angles 至少 3 个，最多 5 个
- coreFacts 至少 3 个
- counterArguments 至少 2 个
- platformAdvice 针对所有推荐平台
- sourceLinks 从提供的信号中提取
- 只输出 JSON，不要包含解释性文字
`;

export interface TopicPackInput {
  topic: {
    title: string;
    angle?: string;
    summary?: string;
    targetAudience?: string;
    tags?: string[];
    recommendedPlatforms?: string[];
  };
  signals?: Array<{
    title: string;
    summary: string;
    url?: string;
    author?: string;
    publishedAt?: string;
  }>;
}

export function buildTopicPackMessages(input: TopicPackInput): ChatMessage[] {
  let userContent = `选题：${input.topic.title}`;

  if (input.topic.angle) userContent += `\n角度：${input.topic.angle}`;
  if (input.topic.summary) userContent += `\n摘要：${input.topic.summary}`;
  if (input.topic.targetAudience) userContent += `\n目标读者：${input.topic.targetAudience}`;
  if (input.topic.tags?.length) userContent += `\n标签：${input.topic.tags.join(', ')}`;
  if (input.topic.recommendedPlatforms?.length)
    userContent += `\n推荐平台：${input.topic.recommendedPlatforms.join(', ')}`;

  if (input.signals?.length) {
    userContent += '\n\n相关资讯：\n';
    userContent += input.signals
      .map(
        (s, i) =>
          `${i + 1}. ${s.title}${s.url ? ` (${s.url})` : ''}\n   ${s.summary}${s.author ? ` — ${s.author}` : ''}${s.publishedAt ? ` [${s.publishedAt}]` : ''}`,
      )
      .join('\n\n');
  }

  return [
    { role: 'system', content: TOPIC_PACK_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}
