import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function RootLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 120 }} />
        <Skeleton shape="title" style={{ width: 200, height: 28 }} />
      </SkeletonGroup>
      <div style={{ marginTop: 32, display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <Skeleton shape="rect" style={{ height: 480 }} />
        </div>
        <div style={{ width: 280, flexShrink: 0 }}>
          <SkeletonGroup>
            <Skeleton shape="rect" style={{ height: 160 }} />
            <Skeleton shape="rect" style={{ height: 120 }} />
            <Skeleton shape="rect" style={{ height: 200 }} />
          </SkeletonGroup>
        </div>
      </div>
    </div>
  );
}
