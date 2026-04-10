import type { ReactNode } from 'react';
import * as styles from './AppShellHeader.css';

interface AppShellHeaderProps {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function AppShellHeader({
  kicker,
  title,
  description,
  action,
}: AppShellHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.textBlock}>
          <p className={styles.kicker}>{kicker}</p>
          <h1 className={styles.title}>{title}</h1>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className={styles.action}>{action}</div>
        ) : null}
      </div>
    </header>
  );
}
