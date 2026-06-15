import type { ReactNode } from 'react';
import * as css from './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <div className={css.container}>
      <div className={css.icon}>{icon}</div>
      <p className={css.title}>{title}</p>
      {description && <p className={css.description}>{description}</p>}
      {action}
      {(primaryAction || secondaryAction) && (
        <div className={css.actions}>
          {primaryAction}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
