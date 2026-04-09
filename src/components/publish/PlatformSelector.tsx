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
            className={`group flex cursor-pointer select-none items-center gap-3 rounded-[var(--wb-radius-xl)] border px-4 py-3 transition-colors ${
              checked
                ? 'border-[color:var(--wb-border-strong)] bg-[color:var(--wb-surface)]'
                : 'border-[color:var(--wb-border)] bg-[color:var(--wb-surface)] hover:border-[color:var(--wb-border-strong)]'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePlatform(platform.id as PlatformId)}
              className="sr-only"
            />
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--wb-radius-lg)] border transition-colors ${
                checked
                  ? 'border-[color:var(--wb-accent-soft)] bg-[color:var(--wb-accent-soft)] text-[color:var(--wb-accent)]'
                  : 'border-[color:var(--wb-border)] bg-[color:var(--wb-bg-elevated)] text-[color:var(--wb-text-muted)] group-hover:text-[color:var(--wb-accent)]'
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
