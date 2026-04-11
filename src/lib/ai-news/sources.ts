import type { AiNewsSource } from '@/lib/ai-news/types';

export const AI_NEWS_SOURCES: AiNewsSource[] = [
  {
    name: '36氪文章',
    url: 'https://36kr.com/feed-article',
    sourceType: 'media',
    weight: 5,
  },
  {
    name: '36氪快讯',
    url: 'https://36kr.com/feed-newsflash',
    sourceType: 'media',
    weight: 4,
  },
  {
    name: '爱范儿',
    url: 'https://www.ifanr.com/feed',
    sourceType: 'media',
    weight: 4,
  },
  {
    name: '爱范儿快讯',
    url: 'https://live.ifanr.com/feed',
    sourceType: 'community',
    weight: 4,
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/rss.xml',
    sourceType: 'media',
    weight: 4,
  },
  {
    name: '极客公园',
    url: 'https://www.geekpark.net/rss',
    sourceType: 'media',
    weight: 4,
  },
  {
    name: 'InfoQ 中文',
    url: 'https://www.infoq.cn/feed',
    sourceType: 'community',
    weight: 3,
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed',
    sourceType: 'media',
    weight: 5,
  },
  {
    name: 'Import AI',
    url: 'https://importai.substack.com/feed',
    sourceType: 'community',
    weight: 4,
  },
];
