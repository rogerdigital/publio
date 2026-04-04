import type { AiNewsSource } from '@/lib/ai-news/types';

export const AI_NEWS_SOURCES: AiNewsSource[] = [
  {
    name: 'Google News AI',
    url:
      'https://news.google.com/rss/search?q=%28AI+OR+%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD+OR+%E5%A4%A7%E6%A8%A1%E5%9E%8B+OR+OpenAI+OR+DeepSeek+OR+%E8%8B%B1%E4%BC%9F%E8%BE%BE%29+when%3A24h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'media',
    weight: 3,
  },
  {
    name: 'Google News 厂商动态',
    url:
      'https://news.google.com/rss/search?q=%28OpenAI+OR+Anthropic+OR+Google+DeepMind+OR+Meta+OR+DeepSeek+OR+%E9%98%BF%E9%87%8C+OR+%E8%85%BE%E8%AE%AF+OR+%E7%99%BE%E5%BA%A6%29+when%3A24h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'media',
    weight: 3,
  },
  {
    name: 'Google News AI 芯片',
    url:
      'https://news.google.com/rss/search?q=%28AI%E8%8A%AF%E7%89%87+OR+%E8%8B%B1%E4%BC%9F%E8%BE%BE+OR+GPU+OR+%E7%AE%97%E5%8A%9B%29+when%3A24h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'media',
    weight: 2,
  },
  {
    name: 'Google News 政策治理',
    url:
      'https://news.google.com/rss/search?q=%28AI%E7%9B%91%E7%AE%A1+OR+AI%E6%B3%95%E8%A7%84+OR+copyright+AI+OR+AI+safety%29+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'community',
    weight: 1,
  },
];
