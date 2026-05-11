import type { ChatMessage } from '../types';
import type { PlatformId } from '@/types';

const FEEDBACK_SYSTEM_PROMPT = `你是一个内容复盘专家。用户发布了一篇内容到社交平台，你需要基于内容本身和指标数据生成结构化复盘建议。

输出格式（严格 JSON，不要 Markdown）：
{
  "performanceSummary": "整体表现一句话总结",
  "effectiveFactors": ["有效因素1", "有效因素2"],
  "issues": ["问题1", "问题2"],
  "topicSuggestions": ["下一步选题建议1", "建议2"],
  "writingSuggestions": ["写作建议1", "建议2"],
  "timingSuggestions": ["发布时间建议1", "建议2"]
}

要求：
- performanceSummary 简洁概括表现水平和亮点
- effectiveFactors 分析哪些做法带来了正面效果（标题、结构、切入角度、时机等）
- issues 指出可改进的方面，避免笼统说"需要优化"
- topicSuggestions 基于本次内容表现推荐下一步选题方向
- writingSuggestions 针对写作手法、结构、表达的具体建议
- timingSuggestions 基于发布时间和平台特征给出时间建议
- 每个数组至少 1 项，最多 3 项
- 只输出 JSON`;

const PLATFORM_LABELS: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

export interface FeedbackAgentInput {
  platform: PlatformId;
  title: string;
  contentSnippet?: string;
  metrics?: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  publishedAt?: string;
}

export function buildFeedbackAgentMessages(input: FeedbackAgentInput): ChatMessage[] {
  let userContent = `平台：${PLATFORM_LABELS[input.platform] || input.platform}`;
  userContent += `\n标题：${input.title}`;

  if (input.contentSnippet) {
    userContent += `\n内容摘要（前500字）：\n${input.contentSnippet.slice(0, 500)}`;
  }

  if (input.metrics) {
    userContent += '\n\n指标数据：';
    userContent += `\n- 阅读量：${input.metrics.views}`;
    userContent += `\n- 点赞：${input.metrics.likes}`;
    userContent += `\n- 评论：${input.metrics.comments}`;
    userContent += `\n- 转发/分享：${input.metrics.shares}`;
  }

  if (input.publishedAt) {
    userContent += `\n发布时间：${input.publishedAt}`;
  }

  return [
    { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}
