'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';

// 品牌原色，路径来自 Simple Icons (simpleicons.org)
function WechatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill="#07C160"
        d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.295.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-3.89-6.348-7.601-6.348zM5.785 7.485a1.068 1.068 0 1 1 0 2.136 1.068 1.068 0 0 1 0-2.136zm4.817 0a1.068 1.068 0 1 1 0 2.136 1.068 1.068 0 0 1 0-2.136zm6.753 3.327c-3.367 0-6.085 2.447-6.085 5.47 0 3.022 2.718 5.47 6.085 5.47.734 0 1.439-.132 2.095-.358a.726.726 0 0 1 .553.077l1.374.803a.27.27 0 0 0 .12.038.218.218 0 0 0 .218-.218c0-.052-.02-.104-.034-.155l-.277-1.062a.435.435 0 0 1 .158-.486c1.312-.97 2.145-2.447 2.145-4.109 0-3.022-2.718-5.47-6.352-5.47zm-2.197 3.853a.783.783 0 1 1 0 1.566.783.783 0 0 1 0-1.566zm4.394 0a.783.783 0 1 1 0 1.566.783.783 0 0 1 0-1.566z"
      />
    </svg>
  );
}

function XiaohongshuIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill="#FF2442"
        d="M12 2.163c-5.47 0-9.837 4.367-9.837 9.837S6.53 21.837 12 21.837s9.837-4.367 9.837-9.837S17.47 2.163 12 2.163zm-.002 3.674c.406 0 .808.044 1.197.128l-1.8 3.12h1.224l-2.232 4.176.576-2.748H9.54l1.458-4.676zm4.134 1.063c.9.9 1.458 2.142 1.458 3.516 0 2.754-2.232 4.986-4.986 4.986a4.968 4.968 0 0 1-2.79-.853l6.318-7.649zm-8.268.018l-.9 1.09a4.979 4.979 0 0 0-.918 2.91c0 2.754 2.232 4.986 4.986 4.986.432 0 .852-.054 1.254-.156l-5.422-8.83z"
      />
    </svg>
  );
}

function ZhihuIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill="#0084FF"
        d="M5.721 0C2.251 0 0 2.25 0 5.719V18.28C0 21.751 2.252 24 5.721 24H18.28C21.751 24 24 21.75 24 18.281V5.72C24 2.249 21.75 0 18.281 0zm6.565 5.17l-.565 1.524H8.595v1.905h2.784l-.56 1.508H8.595V15.9c.468.122.96.185 1.463.185.67 0 1.327-.1 1.947-.3v1.59a6.948 6.948 0 0 1-2.162.33c-3.405 0-5.28-2.06-5.28-5.195V5.17zm5.567 0v5.637h1.58v1.464h-1.58v6.43h-1.636v-6.43h-1.416v-1.464h1.416V5.17z"
      />
    </svg>
  );
}

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fill="#000000"
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.261 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"
      />
    </svg>
  );
}

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
