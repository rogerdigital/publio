'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  Check,
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
              简化标记本次稿件要去哪些平台，只保留清晰的选中状态，不再用过大的平台卡片占据空间。
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--wb-text-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full border border-[color:var(--wb-border)] bg-white/80 px-3 py-1.5">
            <Check size={12} className="text-[color:var(--wb-accent)]" />
            {selectedCount} / {PLATFORMS.length} 已选
          </span>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {PLATFORMS.map((platform) => {
          const Icon = iconMap[platform.icon as keyof typeof iconMap];
          const checked = platforms[platform.id as PlatformId];

          return (
            <label
              key={platform.id}
              className={`group flex cursor-pointer select-none items-center gap-3 rounded-[20px] border px-4 py-3 text-left transition-all ${
                checked
                  ? 'border-[color:var(--wb-border-strong)] bg-[linear-gradient(180deg,rgba(255,248,241,0.98)_0%,rgba(255,242,232,0.96)_100%)] shadow-[0_10px_24px_rgba(215,120,67,0.12)]'
                  : 'border-[color:var(--wb-border)] bg-[rgba(255,252,247,0.72)] hover:border-[color:var(--wb-border-strong)] hover:bg-white hover:shadow-[var(--wb-shadow-tight)]'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => togglePlatform(platform.id as PlatformId)}
                className="sr-only"
              />
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-colors ${
                  checked
                    ? 'border-[color:var(--wb-border-strong)] bg-white text-[color:var(--wb-accent)]'
                    : 'border-[color:var(--wb-border)] bg-white/80 text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-accent)]'
                }`}
              >
                <Icon size={18} />
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[15px] font-medium text-[color:var(--wb-text)]">
                    {platform.name}
                  </p>
                  <p className="mt-1 text-xs leading-6 text-[color:var(--wb-text-muted)]">
                    {checked ? '已选中' : '未选中'}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                    checked
                      ? 'border-[color:var(--wb-border-strong)] bg-white text-[color:var(--wb-accent)]'
                      : 'border-[color:var(--wb-border)] bg-white/75 text-[color:var(--wb-text-muted)]'
                  }`}
                >
                  {checked ? '已选' : '未选'}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
