'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  Check,
  ChevronRight,
  Layers3,
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
} from 'lucide-react';

const iconMap = {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
};

export default function PlatformSelector() {
  const { platforms, togglePlatform } = usePublishStore();
  const selectedCount = PLATFORMS.filter(
    (platform) => platforms[platform.id as PlatformId],
  ).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-[24px] border border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.82)] px-4 py-4 shadow-[var(--wb-shadow-tight)] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl border border-[color:var(--wb-border)] bg-white/85 text-[color:var(--wb-accent)] shadow-[var(--wb-shadow-tight)]">
            <Layers3 size={18} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-[color:var(--wb-accent)]">
              Routing desk
            </p>
            <p className="mt-1 text-sm leading-7 text-[color:var(--wb-text-muted)]">
              选择要下发的渠道，像分发桌上的路由卡一样标记本次稿件的投递范围。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--wb-text-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1.5">
            <Check size={12} className="text-[color:var(--wb-accent)]" />
            {selectedCount} / {PLATFORMS.length} 已选
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1.5">
            <ChevronRight size={12} />
            可随时增减路由
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {PLATFORMS.map((platform) => {
          const Icon = iconMap[platform.icon as keyof typeof iconMap];
          const checked = platforms[platform.id as PlatformId];

          return (
            <label
              key={platform.id}
              className={`group flex min-h-[84px] cursor-pointer select-none items-start gap-3 rounded-[24px] border px-4 py-4 text-left transition-all ${
                checked
                  ? 'border-[color:var(--wb-border-strong)] bg-[linear-gradient(180deg,rgba(255,248,241,0.98)_0%,rgba(255,242,232,0.96)_100%)] shadow-[0_14px_30px_rgba(215,120,67,0.12)]'
                  : 'border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.72)] hover:-translate-y-0.5 hover:border-[color:var(--wb-border-strong)] hover:bg-white hover:shadow-[var(--wb-shadow-tight)]'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePlatform(platform.id as PlatformId)}
                className="sr-only"
              />
              <div
                className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                  checked
                    ? 'border-[color:var(--wb-border-strong)] bg-white text-[color:var(--wb-accent)]'
                    : 'border-[color:var(--wb-border)] bg-white/80 text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-accent)]'
                }`}
              >
                <Icon size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-[color:var(--wb-text)]">
                      {platform.name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[color:var(--wb-text-muted)]">
                      {checked ? '已纳入本次发布路由' : '点击加入分发队列'}
                    </p>
                  </div>
                  <span
                    className={`mt-0.5 inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.22em] ${
                      checked
                        ? 'border-[color:var(--wb-border-strong)] bg-white text-[color:var(--wb-accent)]'
                        : 'border-[color:var(--wb-border)] bg-white/75 text-[color:var(--wb-text-muted)]'
                    }`}
                  >
                    {checked ? 'Selected' : 'Idle'}
                  </span>
                </div>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
