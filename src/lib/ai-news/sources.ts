import type { AiNewsSource } from '@/lib/ai-news/types';

export const AI_NEWS_SOURCES: AiNewsSource[] = [
  {
    name: 'OpenAI News',
    url: 'https://openai.com/news/rss.xml',
    sourceType: 'official',
    weight: 5,
    isOfficialSource: true,
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    sourceType: 'official',
    weight: 4,
    isOfficialSource: true,
  },
  {
    name: 'Google News 官方厂商动态',
    url:
      'https://news.google.com/rss/search?q=%28site%3Aopenai.com+OR+site%3Aanthropic.com+OR+site%3Adeepmind.google+OR+site%3Aabout.fb.com+OR+site%3Anvidia.com+OR+site%3Adeepseek.com+OR+site%3Aalibabacloud.com+OR+site%3Acloud.tencent.com+OR+site%3Aai.baidu.com%29+AI+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'official',
    weight: 4,
    isOfficialSource: true,
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    sourceType: 'media',
    weight: 4,
    creatorWeight: 3,
  },
  {
    name: 'APPSO / 爱范儿',
    url: 'https://www.ifanr.com/feed',
    sourceType: 'community',
    weight: 4,
    creatorWeight: 4,
  },
  {
    name: 'Google News 量子位',
    url:
      'https://news.google.com/rss/search?q=site%3Aqbitai.com+AI+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'community',
    weight: 4,
    creatorWeight: 5,
  },
  {
    name: 'Google News 新智元',
    url:
      'https://news.google.com/rss/search?q=site%3Azhidx.com+AI+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'community',
    weight: 4,
    creatorWeight: 5,
  },
  {
    name: 'Google News 机器之心',
    url:
      'https://news.google.com/rss/search?q=site%3Ajiqizhixin.com+AI+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'community',
    weight: 4,
    creatorWeight: 5,
  },
  {
    name: 'Google News 硅星人 Pro',
    url:
      'https://news.google.com/rss/search?q=site%3Asvreporter.com+AI+when%3A72h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'community',
    weight: 4,
    creatorWeight: 4,
  },
  {
    name: 'Import AI',
    url: 'https://importai.substack.com/feed',
    sourceType: 'community',
    weight: 3,
    creatorWeight: 3,
  },
  {
    name: 'Google News AI 芯片',
    url:
      'https://news.google.com/rss/search?q=%28AI%E8%8A%AF%E7%89%87+OR+%E8%8B%B1%E4%BC%9F%E8%BE%BE+OR+GPU+OR+%E7%AE%97%E5%8A%9B%29+when%3A48h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'media',
    weight: 3,
    creatorWeight: 2,
  },
  {
    name: 'Google News AI 综合',
    url:
      'https://news.google.com/rss/search?q=%28AI+OR+%E4%BA%BA%E5%B7%A5%E6%99%BA%E8%83%BD+OR+%E5%A4%A7%E6%A8%A1%E5%9E%8B+OR+OpenAI+OR+DeepSeek+OR+Anthropic+OR+DeepMind+OR+NVIDIA%29+when%3A24h&hl=zh-CN&gl=CN&ceid=CN%3Azh-Hans',
    sourceType: 'media',
    weight: 2,
    creatorWeight: 1,
  },
];
