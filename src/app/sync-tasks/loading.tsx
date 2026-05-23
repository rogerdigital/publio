import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function SyncTasksLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 100 }} />
        <Skeleton shape="title" style={{ width: 160, height: 28 }} />
      </SkeletonGroup>
      <div style={{ marginTop: 24, display: 'flex', gap: 8 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} shape="rect" style={{ width: 80, height: 32, borderRadius: 16 }} />
        ))}
      </div>
      <div
        style={{
          marginTop: 24,
          display: 'grid',
          gap: 16,
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} shape="rect" style={{ height: 140 }} />
        ))}
      </div>
    </div>
  );
}
