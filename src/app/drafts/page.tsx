import type { Metadata } from 'next';
import DraftsPageClient from './DraftsPageClient';

export const metadata: Metadata = {
  title: '稿件库 | Publio',
  description: '管理所有草稿，查看分发进展。',
};

export default function DraftsPage() {
  return <DraftsPageClient />;
}
