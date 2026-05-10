import { describe, it, expect } from 'vitest';
import { checkContent, maskContent } from '../check';

describe('checkContent', () => {
  it('returns passed for empty text', () => {
    const result = checkContent('');
    expect(result.passed).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it('returns passed for whitespace-only text', () => {
    const result = checkContent('   ');
    expect(result.passed).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it('returns passed for clean text', () => {
    const result = checkContent('这是一段正常的内容，没有任何敏感词。');
    expect(result.passed).toBe(true);
    expect(result.matches).toHaveLength(0);
  });

  it('detects advertising sensitive words', () => {
    const result = checkContent('这是最佳产品，全球第一。');
    expect(result.passed).toBe(false);
    expect(result.matches.length).toBeGreaterThanOrEqual(2);
    expect(result.matches.some((m) => m.word === '最佳')).toBe(true);
    expect(result.matches.some((m) => m.word === '第一')).toBe(true);
  });

  it('detects case-insensitive matches', () => {
    const result = checkContent('100% pure natural');
    expect(result.passed).toBe(false);
    expect(result.matches.some((m) => m.word === '100%')).toBe(true);
  });

  it('detects multiple occurrences of same word', () => {
    const result = checkContent('最佳体验，最佳品质，最佳选择');
    expect(result.passed).toBe(false);
    const bestMatches = result.matches.filter((m) => m.word === '最佳');
    expect(bestMatches).toHaveLength(3);
  });

  it('reports correct positions', () => {
    const result = checkContent('abc最佳def');
    const match = result.matches.find((m) => m.word === '最佳');
    expect(match).toBeDefined();
    expect(match!.position).toBe(3);
    expect(match!.length).toBe(2);
  });

  it('detects general category words', () => {
    const result = checkContent('关于赌博的危害');
    expect(result.passed).toBe(false);
    expect(result.matches[0].category).toBe('general');
  });
});

describe('maskContent', () => {
  it('returns original text when no sensitive words', () => {
    expect(maskContent('正常内容')).toBe('正常内容');
  });

  it('masks single sensitive word', () => {
    const result = maskContent('这是最佳产品');
    expect(result).toBe('这是**产品');
  });

  it('masks multiple sensitive words', () => {
    const result = maskContent('最佳第一');
    expect(result).toBe('****');
  });

  it('preserves text around masked words', () => {
    const result = maskContent('开头最佳中间第一结尾');
    expect(result).toBe('开头**中间**结尾');
  });

  it('handles empty text', () => {
    expect(maskContent('')).toBe('');
  });
});
