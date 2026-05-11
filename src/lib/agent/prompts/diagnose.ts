import type { ChatMessage } from '../types';
import type { PlatformId } from '@/types';

const DIAGNOSE_SYSTEM_PROMPT = `你是一个平台发布故障诊断专家。用户正在使用内容分发工具向多个社交平台发布内容。

当发布失败时，你需要基于错误信息、平台类型、事件时间线和上下文，输出结构化诊断。

输出格式（严格 JSON，不要 Markdown）：
{
  "rootCause": "根因描述（1-2句话）",
  "evidence": ["支撑判断的证据1", "证据2"],
  "fixSteps": ["修复步骤1", "修复步骤2"],
  "shouldRetry": true/false,
  "retryReason": "是否建议重试的原因"
}

要求：
- 针对具体平台给出针对性诊断（微信有审核、小红书有内容规范、知乎有反爬、X有 rate limit）
- fixSteps 必须是具体可操作的步骤
- evidence 从提供的时间线和错误信息中提取
- 不要给笼统的"请稍后重试"建议
- 如果错误码明确指向授权过期，直接建议重新连接
- 只输出 JSON`;

const PLATFORM_LABELS: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

export interface DiagnoseInput {
  platform: PlatformId;
  errorMessage: string;
  statusCode?: number;
  failureCode?: string;
  events?: Array<{ type: string; message?: string; timestamp: string }>;
  variantSnapshot?: { title?: string; contentLength?: number; status?: string };
  publishCheckResult?: string;
}

export function buildDiagnoseMessages(
  platform: PlatformId,
  errorMessage: string,
  statusCode?: number,
  context?: string,
  events?: Array<{ type: string; message?: string; timestamp: string }>,
  variantSnapshot?: { title?: string; contentLength?: number; status?: string },
  publishCheckResult?: string,
): ChatMessage[] {
  let userContent = `平台：${PLATFORM_LABELS[platform] || platform}\n错误信息：${errorMessage}`;
  if (statusCode) userContent += `\nHTTP 状态码：${statusCode}`;
  if (context) userContent += `\n失败码：${context}`;

  if (events?.length) {
    userContent += '\n\n事件时间线：\n';
    userContent += events
      .map((e) => `- [${e.timestamp}] ${e.type}${e.message ? `: ${e.message}` : ''}`)
      .join('\n');
  }

  if (variantSnapshot) {
    userContent += '\n\n渠道版本快照：';
    if (variantSnapshot.title) userContent += `\n标题：${variantSnapshot.title}`;
    if (variantSnapshot.contentLength)
      userContent += `\n正文长度：${variantSnapshot.contentLength} 字`;
    if (variantSnapshot.status) userContent += `\n状态：${variantSnapshot.status}`;
  }

  if (publishCheckResult) {
    userContent += `\n\n发布前检查结果：${publishCheckResult}`;
  }

  return [
    { role: 'system', content: DIAGNOSE_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}
