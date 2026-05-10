import type { ChatMessage } from '../types';
import type { PlatformId } from '@/types';

const DIAGNOSE_SYSTEM_PROMPT = `你是一个平台发布故障诊断专家。用户正在使用内容分发工具向多个社交平台发布内容。

当发布失败时，你需要基于错误信息、平台类型和上下文，给出：
1. **原因分析**（1-2句话）：最可能的失败原因
2. **修复建议**（具体步骤）：用户可以采取的修复操作
3. **是否可重试**：判断这个错误是否值得自动重试

输出格式（纯文本，不要 Markdown 标题）：

原因：[简明原因]

建议：
- [步骤1]
- [步骤2]

可重试：[是/否] — [原因]

要求：
- 针对具体平台给出针对性建议（微信有审核、小红书有内容规范、知乎有反爬、X有 rate limit）
- 不要给笼统的"请稍后重试"建议
- 如果错误码明确指向授权过期，直接建议重新连接`;

const PLATFORM_LABELS: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

export function buildDiagnoseMessages(
  platform: PlatformId,
  errorMessage: string,
  statusCode?: number,
  context?: string,
): ChatMessage[] {
  let userContent = `平台：${PLATFORM_LABELS[platform] || platform}\n错误信息：${errorMessage}`;
  if (statusCode) userContent += `\nHTTP 状态码：${statusCode}`;
  if (context) userContent += `\n补充上下文：${context}`;

  return [
    { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}
