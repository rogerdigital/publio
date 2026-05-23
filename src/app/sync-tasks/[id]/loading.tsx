import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function SyncTaskDetailLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <Skeleton shape="text" style={{ width: 120, marginBottom: 16 }} />
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 100 }} />
        <Skeleton shape="title" style={{ width: 240, height: 28 }} />
      </SkeletonGroup>
      <div style={{ marginTop: 24 }}>
        <SkeletonGroup>
          <Skeleton shape="rect" style={{ height: 100 }} />
          <Skeleton shape="rect" style={{ height: 200 }} />
          <Skeleton shape="rect" style={{ height: 160 }} />
        </SkeletonGroup>
      </div>
    </div>
  );
}
