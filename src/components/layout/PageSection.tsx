import type { HTMLAttributes, ReactNode } from 'react';

import SurfaceCard from '@/components/layout/SurfaceCard';
import { cn } from '@/lib/cn';

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
      className={cn(
        'mx-auto w-full max-w-[1520px] px-0 py-0',
        className,
      )}
    >
      {(eyebrow || title || description || actions) && (
        <SurfaceCard className="mb-5 px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              {eyebrow ? (
                <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2
                  className="font-serif-brand mt-2 text-[28px] leading-tight text-[color:var(--wb-text)] sm:text-[34px]"
                >
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--wb-text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
        </SurfaceCard>
      )}

      <div className="space-y-6">{children}</div>
    </section>
  );
}
