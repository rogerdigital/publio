import type { ChatMessage } from '../types';

const SIGNAL_REVIEW_SYSTEM_PROMPT = `你是一个专注于内容选题的资深编辑助手。

任务：根据提供的最近信号列表和用户品牌/风格画像，帮助用户快速筛选值得关注的内容信号。

输出格式（Markdown）：

## 值得关注
列出 3-5 条最值得关注的信号，说明原因：
- **[信号标题]** — 关注理由（1 句话，结合品牌调性）

## 建议忽略
列出可忽略的信号及简短理由：
- **[信号标题]** — 忽略原因

## 可合并选题
如果多条信号可以合并为一个选题，列出组合建议：
- 合并 [信号A] + [信号B] → 选题角度

## 建议下一步
针对值得关注的信号，给出 1-2 条具体行动建议。

注意：
- 判断标准基于用户画像中的品牌定位、目标受众、内容调性
- 如果没有品牌画像信息，按通用内容价值判断
- 简洁、直接、可操作
`;

export interface SignalReviewInput {
  signals: Array<{ title: string; summary: string; tags?: string[] }>;
  brandProfile?: string;
  styleProfile?: string;
}

export function buildSignalReviewMessages(input: SignalReviewInput): ChatMessage[] {
  const signalList = input.signals
    .map(
      (s, i) =>
        `${i + 1}. ${s.title}\n   ${s.summary}${s.tags?.length ? `\n   标签: ${s.tags.join(', ')}` : ''}`,
    )
    .join('\n\n');

  let userContent = `以下是最近采集到的 ${input.signals.length} 条信号：\n\n${signalList}`;

  if (input.brandProfile || input.styleProfile) {
    userContent += '\n\n---\n\n';
    if (input.brandProfile) userContent += `品牌画像：${input.brandProfile}\n`;
    if (input.styleProfile) userContent += `写作风格：${input.styleProfile}\n`;
  }

  return [
    { role: 'system', content: SIGNAL_REVIEW_SYSTEM_PROMPT },
    { role: 'user', content: userContent },
  ];
}
