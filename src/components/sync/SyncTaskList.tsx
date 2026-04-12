import Link from 'next/link';

import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import * as styles from './sync.css';

const taskStatusLabels: Record<SyncTaskStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  completed: '已完成',
  failed: '失败',
  partial: '部分完成',
  'needs-action': '需要处理',
};

function formatTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '时间待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeZone: 'Asia/Shanghai',
    timeStyle: 'short',
  }).format(timestamp);
}

interface SyncTaskListProps {
  tasks: SyncTask[];
}

export default function SyncTaskList({ tasks }: SyncTaskListProps) {
  if (tasks.length === 0) {
    return <p className={styles.emptyHistory}>还没有分发记录</p>;
  }

  return (
    <div className={styles.historyList}>
      {tasks.map((task) => (
        <article key={task.id} className={styles.historyCard}>
          <div>
            <h2 className={styles.historyTitle}>{task.title}</h2>
            <p className={styles.historyMeta}>
              {taskStatusLabels[task.status]} · {task.receipts.length} 个平台 · 更新于 {formatTime(task.updatedAt)}
            </p>
          </div>
          <Link className={styles.historyLink} href={`/sync-tasks/${task.id}`}>
            查看分发详情
          </Link>
        </article>
      ))}
    </div>
  );
}
