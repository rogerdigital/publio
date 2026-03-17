'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import { MessageSquare, BookOpen, GraduationCap, Twitter } from 'lucide-react';

const iconMap = {
  MessageSquare,
  BookOpen,
  GraduationCap,
  Twitter,
};

export default function PlatformSelector() {
  const { platforms, togglePlatform } = usePublishStore();

  return (
    <div className="flex flex-wrap gap-3">
      {PLATFORMS.map((platform) => {
        const Icon = iconMap[platform.icon as keyof typeof iconMap];
        const checked = platforms[platform.id as PlatformId];

        return (
          <label
            key={platform.id}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all select-none ${
              checked
                ? 'border-[rgba(255,122,69,0.35)] bg-[rgba(255,122,69,0.12)] text-[#fff1e4] shadow-[0_10px_24px_rgba(0,0,0,0.14)]'
                : 'border-white/10 bg-white/5 text-[#b7aea2] hover:border-white/16 hover:bg-white/7 hover:text-[#f6ede2]'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePlatform(platform.id as PlatformId)}
              className="sr-only"
            />
            <Icon size={18} />
            <span className="text-sm font-medium">{platform.name}</span>
            {checked && (
              <span className="h-2 w-2 rounded-full bg-[#ff7a45]" />
            )}
          </label>
        );
      })}
    </div>
  );
}
