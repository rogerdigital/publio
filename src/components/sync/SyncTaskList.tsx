'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardList } from 'lucide-react';

import type { SyncTask, SyncTaskStatus } from '@/lib/sync/types';
import EmptyState from '@/components/feedback/EmptyState';
import FilterChipGroup from '@/components/ui/FilterChipGroup';
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

type StatusFilter = SyncTaskStatus | 'all';

const FILTER_OPTIONS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'completed', label: '已完成' },
  { value: 'failed', label: '失败' },
  { value: 'partial', label: '部分完成' },
  { value: 'needs-action', label: '需要处理' },
  { value: 'syncing', label: '分发中' },
  { value: 'pending', label: '待分发' },
];

export default function SyncTaskList({ tasks }: SyncTaskListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList size={24} />}
        title="还没有分发记录"
        description="发布内容后，分发记录会出现在这里。"
      />
    );
  }

  const filtered = tasks.filter((t) => statusFilter === 'all' || t.status === statusFilter);

  return (
    <>
      <FilterChipGroup
        options={FILTER_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        className={styles.filterBar}
      />
      <div className={styles.historyList}>
        {filtered.map((task) => (
          <article key={task.id} className={styles.historyCard}>
            <div>
              <h2 className={styles.historyTitle}>{task.title}</h2>
              <p className={styles.historyMeta}>
                {taskStatusLabels[task.status]} · {task.receipts.length} 个平台 · 更新于{' '}
                {formatTime(task.updatedAt)}
              </p>
            </div>
            <Link className={styles.historyLink} href={`/sync-tasks/${task.id}`}>
              查看分发详情
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
