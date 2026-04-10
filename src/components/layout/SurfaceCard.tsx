import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type SurfaceTone = 'default' | 'soft' | 'accent';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  children: ReactNode;
}

function toneClasses(tone: SurfaceTone) {
  switch (tone) {
    case 'soft':
      return 'bg-[color:var(--wb-bg-elevated)]';
    case 'accent':
      return 'bg-[rgba(255,246,237,0.92)]';
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
      className={cn(
        'rounded-[var(--wb-radius-xl)] border border-[color:var(--wb-border)] text-[color:var(--wb-text)]',
        toneClasses(tone),
        className,
      )}
    >
      {children}
    </div>
  );
}
