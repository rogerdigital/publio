import type { PlatformId } from '@/types';
import type {
  SyncReceiptStatus,
  SyncTask,
  SyncTaskStatus,
} from '@/lib/sync/types';
import * as styles from './sync.css';

const platformLabels: Record<PlatformId, string> = {
  wechat: '微信公众号',
  xiaohongshu: '小红书',
  zhihu: '知乎',
  x: 'X (Twitter)',
};

const taskStatusLabels: Record<SyncTaskStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  completed: '已完成',
  failed: '失败',
  partial: '部分完成',
};

const receiptStatusLabels: Record<SyncReceiptStatus, string> = {
  pending: '待分发',
  syncing: '分发中',
  'draft-created': '草稿已创建',
  published: '已发布',
  failed: '失败',
  'needs-action': '需要处理',
};

function formatTime(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return '时间待确认';
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(timestamp);
}

interface SyncTaskDetailProps {
  syncTask: SyncTask;
}

export default function SyncTaskDetail({ syncTask }: SyncTaskDetailProps) {
  return (
    <section className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <p className={styles.detailEyebrow}>Sync task</p>
        <h2 className={styles.detailTitle}>{syncTask.title}</h2>
        <p className={styles.detailMeta}>
          {taskStatusLabels[syncTask.status]} · {syncTask.receipts.length} 个平台 · 更新于 {formatTime(syncTask.updatedAt)}
        </p>
      </div>

      <div className={styles.receiptList}>
        {syncTask.receipts.map((receipt) => (
          <article key={receipt.platform} className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <p className={styles.receiptPlatform}>{platformLabels[receipt.platform]}</p>
              <span className={styles.receiptStatus}>
                {receiptStatusLabels[receipt.status]}
              </span>
            </div>
            <p className={styles.receiptMessage}>
              {receipt.message ?? '暂无平台回执信息'} · 第 {receipt.attempts} 次尝试 · {formatTime(receipt.updatedAt)}
            </p>
            {receipt.url ? (
              <a
                className={styles.receiptLink}
                href={receipt.url}
                target="_blank"
                rel="noreferrer"
              >
                打开平台结果
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
