import type { Metadata } from 'next';
import AiNewsPageClient from '@/components/news/AiNewsPageClient';

export const metadata: Metadata = {
  title: 'AI 热点新闻 | Publio',
  description: '聚合当前时间往前 12 小时内的 AI 行业热点新闻。',
};

export default function AiNewsPage() {
  return <AiNewsPageClient />;
}
