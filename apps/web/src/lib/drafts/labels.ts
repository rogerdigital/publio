import type { DraftSource, DraftStatus } from './types';
import type { SyncTaskStatus } from '@/lib/sync/types';

export const statusLabels: Record<DraftStatus, string> = {
  draft: '草稿',
  ready: '待同步',
  syncing: '同步中',
  synced: '已同步',
  failed: '同步失败',
  archived: '已归档',
};

export const STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '全部' },
  ...(['draft', 'ready', 'syncing', 'synced', 'failed'] as const).map((s) => ({
    value: s,
    label: statusLabels[s],
  })),
];

export const sourceLabels: Record<DraftSource, string> = {
  manual: '手动创建',
  import: '导入',
};

export const syncStatusLabels: Record<SyncTaskStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  completed: '已完成',
  failed: '失败',
  partial: '部分完成',
  'needs-action': '需要处理',
};
