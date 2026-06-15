import type { SensitiveCategory } from './types';

interface WordEntry {
  word: string;
  category: SensitiveCategory;
}

/**
 * 内置敏感词库。
 * MVP 阶段使用基础词库，后续可接入第三方服务或扩展词库文件。
 */
export const SENSITIVE_WORDS: WordEntry[] = [
  // 广告法违禁词（电商/营销高频）
  { word: '最佳', category: 'advertising' },
  { word: '最好', category: 'advertising' },
  { word: '第一', category: 'advertising' },
  { word: '唯一', category: 'advertising' },
  { word: '顶级', category: 'advertising' },
  { word: '极品', category: 'advertising' },
  { word: '国家级', category: 'advertising' },
  { word: '绝无仅有', category: 'advertising' },
  { word: '万能', category: 'advertising' },
  { word: '100%', category: 'advertising' },
  { word: '纯天然', category: 'advertising' },
  { word: '祖传秘方', category: 'advertising' },
  { word: '无副作用', category: 'advertising' },

  // 通用敏感词（示例，实际应根据业务需求扩展）
  { word: '赌博', category: 'general' },
  { word: '毒品', category: 'general' },
  { word: '枪支', category: 'general' },
  { word: '爆炸物', category: 'general' },
];
