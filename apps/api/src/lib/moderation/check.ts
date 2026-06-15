import type { ModerationResult, SensitiveMatch } from './types';
import { SENSITIVE_WORDS } from './sensitiveWords';

/**
 * 检查文本中是否包含敏感词。
 * 使用简单正则匹配，MVP 阶段够用。
 */
export function checkContent(text: string): ModerationResult {
  if (!text || text.trim().length === 0) {
    return { passed: true, matches: [] };
  }

  const matches: SensitiveMatch[] = [];
  const normalizedText = text.toLowerCase();

  for (const entry of SENSITIVE_WORDS) {
    const keyword = entry.word.toLowerCase();
    let startIndex = 0;

    while (true) {
      const position = normalizedText.indexOf(keyword, startIndex);
      if (position === -1) break;

      matches.push({
        word: entry.word,
        category: entry.category,
        position,
        length: entry.word.length,
      });

      startIndex = position + 1;
    }
  }

  return {
    passed: matches.length === 0,
    matches,
  };
}

/**
 * 将文本中的敏感词替换为等长的 * 号。
 */
export function maskContent(text: string): string {
  const { matches } = checkContent(text);
  if (matches.length === 0) return text;

  // 按位置倒序排列，从后往前替换避免偏移
  const sorted = [...matches].sort((a, b) => b.position - a.position);
  let result = text;

  for (const match of sorted) {
    const mask = '*'.repeat(match.length);
    result = result.slice(0, match.position) + mask + result.slice(match.position + match.length);
  }

  return result;
}
