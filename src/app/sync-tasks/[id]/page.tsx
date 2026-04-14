import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SyncTaskDetail from '@/components/sync/SyncTaskDetail';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import * as styles from './page.css';

export const metadata = {
  title: '分发详情 - Publio',
};

interface SyncTaskDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SyncTaskDetailPage({ params }: SyncTaskDetailPageProps) {
  const { id } = await params;
  const syncTask = getSyncHistoryStore().getTask(id);

  if (!syncTask) {
    notFound();
  }

  return (
    <div className={styles.pageWrap}>
      <Link className={styles.backLink} href="/sync-tasks">
        <ArrowLeft size={14} />
        返回分发记录
      </Link>
      <AppShellHeader
        kicker="Sync history"
        title="分发详情"
        description="查看各平台回执、发布时间、失败原因和平台结果链接。"
      />
      <SyncTaskDetail syncTask={syncTask} />
    </div>
  );
}
