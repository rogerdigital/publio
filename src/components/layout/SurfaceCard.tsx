import type { HTMLAttributes, ReactNode } from 'react';

type SurfaceTone = 'default' | 'soft' | 'accent';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  children: ReactNode;
}

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

function toneClasses(tone: SurfaceTone) {
  switch (tone) {
    case 'soft':
      return 'bg-[color:var(--wb-bg-elevated)]';
    case 'accent':
      return 'bg-[color:var(--wb-surface)]';
    default:
      return 'bg-[color:var(--wb-surface)]';
  }
}

export default function SurfaceCard({
  tone = 'default',
  className,
  children,
  ...props
}: SurfaceCardProps) {
  return (
    <div
      {...props}
      className={joinClasses(
        'rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] text-[color:var(--wb-text)]',
        toneClasses(tone),
        className,
      )}
    >
      {children}
    </div>
  );
}
