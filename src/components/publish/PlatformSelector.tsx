'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  WechatIcon,
  XiaohongshuIcon,
  ZhihuIcon,
  XIcon,
} from '@/components/icons/PlatformIcons';

const platformIconMap: Record<PlatformId, React.ComponentType<{ size?: number }>> = {
  wechat: WechatIcon,
  xiaohongshu: XiaohongshuIcon,
  zhihu: ZhihuIcon,
  x: XIcon,
};

export default function PlatformSelector() {
  const { platforms, togglePlatform } = usePublishStore();

  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((platform) => {
        const Icon = platformIconMap[platform.id as PlatformId];
        const checked = platforms[platform.id as PlatformId];

        return (
          <label
            key={platform.id}
            className={`inline-flex cursor-pointer select-none items-center gap-2 rounded-[var(--wb-radius-lg)] px-3 py-2 text-sm transition-colors ${
              checked
                ? 'bg-[color:var(--wb-accent-soft)] font-medium text-[color:var(--wb-accent-strong)]'
                : 'bg-[color:var(--wb-bg-elevated)] text-[color:var(--wb-text-muted)] hover:bg-[color:var(--wb-surface)] hover:text-[color:var(--wb-text)]'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePlatform(platform.id as PlatformId)}
              className="sr-only"
            />
            <Icon size={16} />
            {platform.name}
          </label>
        );
      })}
    </div>
  );
}
