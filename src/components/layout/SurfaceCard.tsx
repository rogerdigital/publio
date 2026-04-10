import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { surfaceCard } from './SurfaceCard.css';

type SurfaceTone = 'default' | 'soft' | 'accent';

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: SurfaceTone;
  children: ReactNode;
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
      className={cn(surfaceCard({ tone }), className)}
    >
      {children}
    </div>
  );
}
