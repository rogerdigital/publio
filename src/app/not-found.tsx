import Link from 'next/link';
import * as styles from './error.css';

export default function NotFound() {
  return (
    <div className={styles.errorPage}>
      <div className={styles.errorCard}>
        <p className={styles.errorKicker}>Publio</p>
        <h1 className={styles.errorTitle}>页面不存在</h1>
        <p className={styles.errorText}>
          你访问的页面不存在或已被移除。请检查地址是否正确，或返回首页继续。
        </p>
        <div className={styles.actions}>
          <Link href="/" className={styles.retryButton}>
            返回首页
          </Link>
          <Link href="/drafts" className={styles.secondaryLink}>
            去稿件库
          </Link>
        </div>
      </div>
    </div>
  );
}
