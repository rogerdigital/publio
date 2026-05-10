import type { ReactNode } from 'react';
import * as css from './EmptyState.css';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className={css.container}>
      <div className={css.icon}>{icon}</div>
      <p className={css.title}>{title}</p>
      {description && <p className={css.description}>{description}</p>}
      {action}
    </div>
  );
}
