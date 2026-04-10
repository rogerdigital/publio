'use client';

import * as styles from './error.css';

export default function AiNewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <p className={styles.errorKicker}>AI Daily Wire</p>
        <h1 className={styles.errorTitle}>AI 新闻页暂时出了点问题</h1>
        <p className={styles.errorText}>
          我们已经拦住了这次异常，页面不会再直接白屏。你可以先重试一次；如果问题还在，错误信息也会保留下来方便继续排查。
        </p>
        <div className={styles.errorDetail}>
          {error.message || '未知客户端异常'}
        </div>
        <button
          type="button"
          onClick={reset}
          className={styles.retryButton}
        >
          重新加载页面
        </button>
      </div>
    </div>
  );
}
