import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function AnalyticsLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 100 }} />
        <Skeleton shape="title" style={{ width: 160, height: 28 }} />
      </SkeletonGroup>
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} shape="rect" style={{ height: 180 }} />
        ))}
      </div>
    </div>
  );
}
