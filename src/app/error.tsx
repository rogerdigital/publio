'use client';

import Link from 'next/link';
import * as styles from './error.css';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <p className={styles.errorKicker}>Publio</p>
        <h1 className={styles.errorTitle}>页面加载出错了</h1>
        <p className={styles.errorText}>
          当前页面遇到了一个异常。你可以尝试重新加载，或者返回首页。
        </p>
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
