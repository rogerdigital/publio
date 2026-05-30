import type { WritingAction, ChatMessage } from '../types';

const SYSTEM_BASE = `你是一个专业的中文内容写作助手。你的输出直接用于 Markdown 文档。
要求：
- 输出纯 Markdown 格式，不要包裹在代码块中
- 保持作者原有的语气和风格
- 不要添加多余的解释性文字，直接输出结果`;

const ACTION_PROMPTS: Record<WritingAction, string> = {
  rewrite: `${SYSTEM_BASE}

任务：改写用户提供的内容。
- 用不同的表述方式传达相同观点
- 可以调整段落结构和句式
- 保持信息量一致`,

  title: `${SYSTEM_BASE}

任务：基于用户提供的文章生成 3-5 个标题建议。
- 每个标题单独占一行，用有序列表输出
- 标题要具体、清晰，避免空泛营销腔
- 不要输出解释、分析或正文改写`,
};

/**
 * 构建 writing agent 的 messages 数组
 */
export function buildWritingMessages(
  action: WritingAction,
  content: string,
  options?: {
    title?: string;
    selection?: string;
  },
): ChatMessage[] {
  const systemPrompt = ACTION_PROMPTS[action];

  const messages: ChatMessage[] = [{ role: 'system', content: systemPrompt }];

  let userContent = '';

  if (options?.title) {
    userContent += `标题：${options.title}\n\n`;
  }

  if (options?.selection) {
    userContent += `以下是需要处理的选中片段：\n\n${options.selection}\n\n`;
    userContent += `完整文章上下文：\n\n${content}`;
  } else {
    userContent += content;
  }

  messages.push({ role: 'user', content: userContent });

  return messages;
}
