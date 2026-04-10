'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  WechatIcon,
  XiaohongshuIcon,
  ZhihuIcon,
  XIcon,
} from '@/components/icons/PlatformIcons';
import { selectorWrap, platformLabel, srOnly } from './publish.css';

const platformIconMap: Record<PlatformId, React.ComponentType<{ size?: number }>> = {
  wechat: WechatIcon,
  xiaohongshu: XiaohongshuIcon,
  zhihu: ZhihuIcon,
  x: XIcon,
};

export default function PlatformSelector() {
  const { platforms, togglePlatform } = usePublishStore();

  return (
    <div className={selectorWrap}>
      {PLATFORMS.map((platform) => {
        const Icon = platformIconMap[platform.id as PlatformId];
        const checked = platforms[platform.id as PlatformId];

        return (
          <label
            key={platform.id}
            className={platformLabel({ checked })}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => togglePlatform(platform.id as PlatformId)}
              className={srOnly}
            />
            <Icon size={16} />
            {platform.name}
          </label>
        );
      })}
    </div>
  );
}
