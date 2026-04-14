import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import AppShellHeader from '@/components/layout/AppShellHeader';
import SyncTaskList from '@/components/sync/SyncTaskList';
import { getSyncHistoryStore } from '@/lib/sync/registry';
import * as styles from './page.css';

export const metadata = {
  title: '分发记录 - Publio',
};

export default function SyncTasksPage() {
  const tasks = getSyncHistoryStore().listTasks();

  return (
    <div className={styles.pageWrap}>
      <Link className={styles.backLink} href="/">
        <ArrowLeft size={14} />
        返回写作台
      </Link>
      <AppShellHeader
        kicker="Sync history"
        title="分发记录"
        description="集中查看已发布、失败、需要人工处理和可重试的分发任务。"
      />
      <SyncTaskList tasks={tasks} />
    </div>
  );
}
