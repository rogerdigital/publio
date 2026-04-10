import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import SurfaceCard from '@/components/layout/SurfaceCard';
import * as styles from './PageSection.css';

interface PageSectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function PageSection({
  eyebrow,
  title,
  description,
  actions,
  className,
  children,
  ...props
}: PageSectionProps) {
  return (
    <section
      {...props}
      className={cn(styles.section, className)}
    >
      {(eyebrow || title || description || actions) && (
        <SurfaceCard className={styles.sectionHeader}>
          <div className={styles.sectionHeaderInner}>
            <div className={styles.sectionTextBlock}>
              {eyebrow ? (
                <p className={styles.eyebrow}>{eyebrow}</p>
              ) : null}
              {title ? (
                <h2 className={styles.sectionTitle}>{title}</h2>
              ) : null}
              {description ? (
                <p className={styles.sectionDescription}>{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className={styles.sectionActions}>{actions}</div>
            ) : null}
          </div>
        </SurfaceCard>
      )}
      <div className={styles.sectionContent}>{children}</div>
    </section>
  );
}
