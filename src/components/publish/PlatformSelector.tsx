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
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border cursor-pointer transition-all select-none ${
              checked
                ? 'border-blue-300 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
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
              <span className="w-2 h-2 rounded-full bg-blue-500" />
            )}
          </label>
        );
      })}
    </div>
  );
}
