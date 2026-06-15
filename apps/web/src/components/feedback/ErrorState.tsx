import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import * as css from './EmptyState.css';

interface ErrorStateProps {
  title?: string;
  details?: string;
  nextAction?: string;
  retry?: ReactNode;
}

export default function ErrorState({
  title = '出了点问题',
  details,
  nextAction,
  retry,
}: ErrorStateProps) {
  return (
    <div className={css.container}>
      <div className={css.icon}>
        <AlertCircle size={32} />
      </div>
      <p className={css.title}>{title}</p>
      {details && <p className={css.description}>{details}</p>}
      {nextAction && (
        <p className={css.description} style={{ fontWeight: 500 }}>
          下一步：{nextAction}
        </p>
      )}
      {retry && <div className={css.actions}>{retry}</div>}
    </div>
  );
}
