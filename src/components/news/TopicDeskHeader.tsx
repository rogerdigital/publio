import { FileUp, RefreshCw, Sparkles } from 'lucide-react';

import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';

interface TopicDeskHeaderProps {
  generatedAt: string;
  itemCount: number;
  briefCount: number;
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
  itemCount,
  briefCount,
  onRefresh,
  onBuildDigest,
  loading,
  refreshing,
}: TopicDeskHeaderProps) {
  return (
    <div className="space-y-4">
      <AppShellHeader
        kicker="Today’s AI Topics"
        title="今日 AI 话题工作台"
        description="把最近 12 小时的 AI 信息整理成一张可继续编辑的选题桌：中间是候选信号，右侧是研究笔记，适合继续补写为可发布稿件。"
      />

      <SurfaceCard tone="soft" className="px-5 py-5 sm:px-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                选题状态
              </p>
              <p className="mt-2 text-[18px] leading-none text-[color:var(--wb-ink)]">
                {formatSourceState(itemCount)}
              </p>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                研究提要
              </p>
              <p className="mt-2 text-[18px] leading-none text-[color:var(--wb-ink)]">
                {briefCount > 0 ? `${briefCount} 条聚焦` : '暂无提要'}
              </p>
            </div>
            <div className="rounded-[22px] border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.58)] px-4 py-3">
              <p className="text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
                最新抓取
              </p>
              <p className="mt-2 text-[18px] leading-none text-[color:var(--wb-ink)]">
                {generatedAt || '准备中'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onBuildDigest}
              disabled={loading || refreshing || itemCount === 0}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border-strong)] bg-[color:var(--wb-accent)] px-4 py-2 text-sm font-medium text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileUp size={16} />
              生成候选稿
            </button>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,255,255,0.72)] px-4 py-2 text-sm font-medium text-[color:var(--wb-ink)] transition hover:bg-[rgba(255,255,255,0.95)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : undefined} />
              {refreshing ? '刷新中' : '刷新信号'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.26em] text-[color:var(--wb-muted)]">
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
        </div>
      </SurfaceCard>
    </div>
  );
}
