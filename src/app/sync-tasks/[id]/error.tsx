'use client';

import Link from 'next/link';
import * as styles from '@/app/error.css';

export default function SyncTaskDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <p className={styles.errorKicker}>分发详情</p>
        <h1 className={styles.errorTitle}>分发详情加载失败</h1>
        <p className={styles.errorText}>
          读取该分发任务的详情时遇到异常。你可以尝试重新加载，或返回分发记录列表。
        </p>
        {error.message && <div className={styles.errorDetail}>{error.message}</div>}
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.retryButton}>
            重新加载
          </button>
          <Link href="/sync-tasks" className={styles.secondaryLink}>
            返回分发记录
          </Link>
        </div>
      </div>
    </div>
  );
}
