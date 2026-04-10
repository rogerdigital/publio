import { RefreshCw } from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';

interface TopicDeskHeaderProps {
  generatedAt: string;
  todayCount: number;
  followCount: number;
  onRefresh: () => void;
  loading: boolean;
  refreshing: boolean;
}

export default function TopicDeskHeader({
  generatedAt,
  todayCount,
  followCount,
  onRefresh,
  loading,
  refreshing,
}: TopicDeskHeaderProps) {
  return (
    <AppShellHeader
      kicker="Topic desk"
      title="选题工作台"
      description={`把最近 24 小时的 AI 信息压成可判断的选题列表。${generatedAt ? `最近更新：${generatedAt}。` : ''}今天能发 ${todayCount} 条，还能追 ${followCount} 条。`}
      action={
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-[var(--wb-radius-lg)] border border-transparent bg-[color:var(--wb-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
          {refreshing ? '抓取中' : '抓取选题'}
        </button>
      }
    />
  );
}
