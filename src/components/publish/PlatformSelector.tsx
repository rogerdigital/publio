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
                ? 'border-[#efc6af] bg-[#fff2e8] text-[#b95e31] shadow-[0_10px_24px_rgba(215,120,67,0.12)]'
                : 'border-[#e8ddd2] bg-[#fffdfb] text-[#76695f] hover:border-[#dfcfbf] hover:bg-white hover:text-[#2b221d]'
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
              <span className="h-2 w-2 rounded-full bg-[#ef6b38]" />
            )}
          </label>
        );
      })}
    </div>
  );
}
