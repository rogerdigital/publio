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
      return 'bg-[linear-gradient(180deg,rgba(255,252,247,0.94)_0%,rgba(246,238,229,0.92)_100%)]';
    case 'accent':
      return 'bg-[linear-gradient(180deg,rgba(255,248,241,0.96)_0%,rgba(245,231,219,0.95)_100%)] border-[color:var(--wb-border-strong)]';
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
        'rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] text-[color:var(--wb-text)] shadow-[var(--wb-shadow-lg)] backdrop-blur-sm',
        toneClasses(tone),
        className,
      )}
    >
      {children}
    </div>
  );
}
