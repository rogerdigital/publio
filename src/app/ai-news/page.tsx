import type { Metadata } from 'next';
import AiNewsPageClient from '@/components/news/AiNewsPageClient';

export const metadata: Metadata = {
  title: 'AI 话题工作台 | Publio',
  description: '以研究终端式版面整理最近 12 小时的 AI 话题信号与编辑提要。',
};

export default function AiNewsPage() {
  return <AiNewsPageClient />;
}
