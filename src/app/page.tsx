import type { Metadata } from 'next';
import HomePageClient from './page-client';

export const metadata: Metadata = {
  title: '写作台 — Publio',
  description: '在一个界面里完成写作、排版预览与多平台分发。',
};

export default function HomePage() {
  return <HomePageClient />;
}
