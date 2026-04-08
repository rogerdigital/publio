import { FileUp, RefreshCw, Sparkles } from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';

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

function formatSourceState(count: number) {
  return count > 0 ? `${count} 条候选` : '等待抓取';
}

export default function TopicDeskHeader({
  generatedAt,
  signalCount,
  todayCount,
  followCount,
  onRefresh,
  onBuildDigest,
  loading,
  refreshing,
}: TopicDeskHeaderProps) {
  return (
    <div className="space-y-3">
      <AppShellHeader
        kicker="Today’s AI Topics"
        title="今日 AI 话题工作台"
        description="把最近 3 天的 AI 信息压成可判断的选题列表，先选题，再看底稿，再决定是否进入写作台。"
      />

      <SurfaceCard tone="soft" className="px-5 py-4 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                选题状态
              </p>
              <p className="mt-2 text-[18px] leading-none text-[color:var(--wb-ink)]">
                {formatSourceState(todayCount + followCount)}
              </p>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                抓取信号
              </p>
              <p className="mt-2 text-[18px] leading-none text-[color:var(--wb-ink)]">
                {signalCount > 0 ? `${signalCount} 条原始资讯` : '暂无信号'}
              </p>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                分层结果
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span>
                  <span className="text-[18px] leading-none text-[color:var(--wb-ink)]">{todayCount}</span>
                  <span className="ml-1 text-[11px] text-[color:var(--wb-muted)]">今天能发</span>
                </span>
                <span className="text-[color:var(--wb-muted)]">/</span>
                <span>
                  <span className="text-[18px] leading-none text-[color:var(--wb-ink)]">{followCount}</span>
                  <span className="ml-1 text-[11px] text-[color:var(--wb-muted)]">还能追</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBuildDigest}
              disabled={loading || refreshing || todayCount + followCount === 0}
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
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5">
            <Sparkles size={12} />
            编辑模式
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5">
            主题先行
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5">
            候选排序
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.62)] px-3 py-1.5">
            {generatedAt || '等待刷新'}
          </span>
        </div>
      </SurfaceCard>
    </div>
  );
}
