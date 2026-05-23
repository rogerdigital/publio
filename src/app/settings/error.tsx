'use client';

import Link from 'next/link';
import * as styles from '@/app/error.css';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <p className={styles.errorKicker}>设置</p>
        <h1 className={styles.errorTitle}>设置页加载失败</h1>
        <p className={styles.errorText}>读取配置信息时遇到异常。你可以尝试重新加载，或返回首页。</p>
        {error.message && <div className={styles.errorDetail}>{error.message}</div>}
        <div className={styles.actions}>
          <button type="button" onClick={reset} className={styles.retryButton}>
            重新加载
          </button>
          <Link href="/" className={styles.secondaryLink}>
            返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
