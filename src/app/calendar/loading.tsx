import Skeleton, { SkeletonGroup } from '@/components/feedback/Skeleton';

export default function CalendarLoading() {
  return (
    <div style={{ padding: '28px 36px' }}>
      <SkeletonGroup>
        <Skeleton shape="title" style={{ width: 100 }} />
        <Skeleton shape="title" style={{ width: 200, height: 28 }} />
      </SkeletonGroup>
      <div style={{ marginTop: 24 }}>
        <Skeleton shape="rect" style={{ height: 400 }} />
      </div>
    </div>
  );
}
