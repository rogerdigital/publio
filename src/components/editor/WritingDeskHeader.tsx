'use client';

import { usePublishStore } from '@/stores/publishStore';
import AppShellHeader from '@/components/layout/AppShellHeader';
import SurfaceCard from '@/components/layout/SurfaceCard';

export default function WritingDeskHeader() {
  const { title, setTitle } = usePublishStore();

  return (
    <div className="space-y-4">
      <AppShellHeader
        kicker="Writing desk"
        title="研究、撰写、校对与分发，在同一张编辑桌面上持续进行。"
        description="这是一张面向长文与快讯的工作台。标题从这里定稿，正文在中间继续打磨，右侧则随时核对成稿与发布状态。"
      />

      <SurfaceCard tone="soft" className="px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
                Draft headline
              </p>
              <h2
                className="mt-2 text-[20px] leading-tight text-[color:var(--wb-text)] sm:text-[24px]"
                style={{ fontFamily: 'var(--wb-font-serif)' }}
              >
                先定标题，再展开结构和证据。
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--wb-text-muted)]">
                标题会同步到预览和发布流程，也会在从选题台回填时自动带入当前稿件。
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1 text-xs text-[color:var(--wb-text-muted)] shadow-[var(--wb-shadow-tight)]">
                继续编辑中
              </span>
              <span className="rounded-full border border-[color:var(--wb-border)] bg-[rgba(255,246,237,0.9)] px-3 py-1 text-xs text-[color:var(--wb-accent)] shadow-[var(--wb-shadow-tight)]">
                草稿自动回填
              </span>
            </div>
          </div>

          <label className="block">
            <span className="sr-only">文章标题</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="输入文章标题..."
              className="w-full border-0 border-b border-[color:var(--wb-border-strong)] bg-transparent px-0 pb-3 text-[28px] leading-tight text-[color:var(--wb-text)] outline-none transition-all placeholder:text-[color:var(--wb-text-muted)] focus:border-[color:var(--wb-accent)] focus:bg-[rgba(255,255,255,0.6)] focus:pl-4 focus:pr-4 focus:pt-2 focus:pb-4 focus:shadow-[0_0_0_4px_rgba(200,106,61,0.12)] focus-visible:border-[color:var(--wb-accent)] focus-visible:bg-[rgba(255,255,255,0.6)] focus-visible:pl-4 focus-visible:pr-4 focus-visible:pt-2 focus-visible:pb-4 focus-visible:shadow-[0_0_0_4px_rgba(200,106,61,0.12)] sm:text-[34px]"
              style={{ fontFamily: 'var(--wb-font-serif)' }}
            />
          </label>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[color:var(--wb-text-muted)]">
            <span>适合长文、深度稿和平台分发内容</span>
            <span className="hidden h-1 w-1 rounded-full bg-[color:var(--wb-border-strong)] sm:inline-block" />
            <span>标题、正文与发布状态保持同一工作流</span>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
