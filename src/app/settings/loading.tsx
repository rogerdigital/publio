import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function SettingsLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 100 }} />
        <Skeleton shape="title" style={{ width: 160, height: 28 }} />
      </SkeletonGroup>
      <div style={{ marginTop: 24 }}>
        <SkeletonGroup>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} shape="rect" style={{ height: 64 }} />
          ))}
        </SkeletonGroup>
      </div>
    </div>
  );
}
