import { FileUp, RefreshCw } from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';

interface TopicDeskHeaderProps {
  generatedAt: string;
  signalCount: number;
  todayCount: number;
  followCount: number;
  onRefresh: () => void;
  onBuildDigest: () => void;
  loading: boolean;
  refreshing: boolean;
}

export default function TopicDeskHeader({
  generatedAt,
  todayCount,
  followCount,
  onRefresh,
  onBuildDigest,
  loading,
  refreshing,
}: TopicDeskHeaderProps) {
  const hasContent = todayCount + followCount > 0;

  return (
    <AppShellHeader
      kicker="Today's AI Topics"
      title="今日 AI 话题工作台"
      description={`把最近 24 小时的 AI 信息压成可判断的选题列表。${generatedAt ? `最近更新：${generatedAt}。` : ''}今天能发 ${todayCount} 条，还能追 ${followCount} 条。`}
      action={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBuildDigest}
            disabled={loading || refreshing || !hasContent}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[color:var(--wb-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FileUp size={16} />
            生成研究底稿
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading || refreshing}
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[rgba(255,255,255,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
            {refreshing ? '抓取中' : '抓取选题'}
          </button>
        </div>
      }
    />
  );
}
