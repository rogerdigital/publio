import type { ChatMessage } from '../types';

const RESEARCH_SYSTEM_PROMPT = `你是一个专业的科技新闻分析师，擅长从多个新闻源中提炼深度洞察。

任务：基于提供的话题聚类数据（多篇相关报道的标题和摘要），生成结构化的深度分析。

输出格式（Markdown）：

## 核心事件
用 2-3 句话概括这个话题的核心事件。

## 多角度解读
从不同维度分析这个事件：
- **技术维度**：技术层面的意义和影响
- **商业维度**：对行业格局和商业模式的影响
- **用户维度**：对普通用户的实际影响

## 趋势判断
- 这个事件反映了什么长期趋势？
- 未来 3-6 个月可能的发展方向？

## 写作建议
针对内容创作者的建议：
- 推荐的写作角度（2-3 个）
- 目标受众定位
- 适合的发布平台和内容形式

## 关键引用
从原始报道中提取 2-3 条最有价值的信息点，可直接用于文章引用。

要求：
- 分析要有深度，不要停留在新闻表面
- 趋势判断要基于事实推断，不要空泛
- 写作建议要具体可执行`;

/**
 * 构建 research agent 的 messages 数组
 */
export function buildResearchMessages(
  clusterTitle: string,
  signals: Array<{ title: string; summary: string; source: string; publishedAt?: string }>,
): ChatMessage[] {
  const signalList = signals
    .map((s, i) => `${i + 1}. [${s.source}] ${s.title}\n   ${s.summary}${s.publishedAt ? `\n   发布时间: ${s.publishedAt}` : ''}`)
    .join('\n\n');

  return [
    { role: 'system', content: RESEARCH_SYSTEM_PROMPT },
    {
      role: 'user',
      content: `话题：${clusterTitle}\n\n相关报道：\n\n${signalList}`,
    },
  ];
}
