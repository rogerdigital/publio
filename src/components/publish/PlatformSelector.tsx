'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
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

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {PLATFORMS.map((platform) => {
        const Icon = iconMap[platform.icon as keyof typeof iconMap];
        const checked = platforms[platform.id as PlatformId];

        return (
          <label
            key={platform.id}
            className={`group flex cursor-pointer select-none items-center gap-3 rounded-[20px] border px-4 py-3 transition-all ${
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
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                checked
                  ? 'border-[color:var(--wb-border-strong)] bg-white text-[color:var(--wb-accent)]'
                  : 'border-[color:var(--wb-border)] bg-white/80 text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-accent)]'
              }`}
            >
              <Icon size={16} />
            </div>
            <span className="text-[15px] font-medium text-[color:var(--wb-text)]">
              {platform.name}
            </span>
          </label>
        );
      })}
    </div>
  );
}
