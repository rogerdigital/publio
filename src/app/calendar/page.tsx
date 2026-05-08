import type { Metadata } from 'next';
import CalendarPageClient from '@/components/calendar/CalendarPageClient';

export const metadata: Metadata = {
  title: '内容排期 | Publio',
  description: '查看和管理内容发布排期日历。',
};

export default function CalendarPage() {
  return <CalendarPageClient />;
}
