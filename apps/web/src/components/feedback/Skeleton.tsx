import type { HTMLAttributes } from 'react';
import { skeleton, skeletonGroup } from './Skeleton.css';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  shape?: 'text' | 'title' | 'circle' | 'rect';
}

export default function Skeleton({ shape = 'text', className, ...props }: SkeletonProps) {
  return <div {...props} className={`${skeleton({ shape })} ${className ?? ''}`} />;
}

export function SkeletonGroup({ children }: { children: React.ReactNode }) {
  return <div className={skeletonGroup}>{children}</div>;
}
