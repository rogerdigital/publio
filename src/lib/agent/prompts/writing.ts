import type { WritingAction, ChatMessage } from '../types';

const SYSTEM_BASE = `你是一个专业的中文内容写作助手。你的输出直接用于 Markdown 文档。
要求：
- 输出纯 Markdown 格式，不要包裹在代码块中
- 保持作者原有的语气和风格
- 不要添加多余的解释性文字，直接输出结果`;

const ACTION_PROMPTS: Record<WritingAction, string> = {
  expand: `${SYSTEM_BASE}

任务：扩写用户提供的内容。
- 保持核心观点不变，补充论据、细节、案例
- 扩写后篇幅约为原文的 2-3 倍
- 保持段落结构清晰`,

  condense: `${SYSTEM_BASE}

任务：缩写用户提供的内容。
- 提炼核心观点，删除冗余表述
- 缩写后篇幅约为原文的 1/3 到 1/2
- 确保关键信息不丢失`,

  rewrite: `${SYSTEM_BASE}

任务：改写用户提供的内容。
- 用不同的表述方式传达相同观点
- 可以调整段落结构和句式
- 保持信息量一致`,

  polish: `${SYSTEM_BASE}

任务：润色用户提供的内容。
- 修正语法和用词问题
- 提升可读性和表达流畅度
- 最小化改动，保持原意不变`,

  continue: `${SYSTEM_BASE}

任务：续写用户提供的内容。
- 根据已有内容的主题和方向继续撰写
- 保持连贯的叙事或论述逻辑
- 续写约 200-400 字`,
};

/**
 * 构建 writing agent 的 messages 数组
 */
export function buildWritingMessages(
  action: WritingAction,
  content: string,
  options?: { title?: string; selection?: string }
): ChatMessage[] {
  const messages: ChatMessage[] = [
    { role: 'system', content: ACTION_PROMPTS[action] },
  ];

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
