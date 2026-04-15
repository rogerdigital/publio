'use client';

import { usePublishStore } from '@/stores/publishStore';
import { PLATFORMS, PlatformId } from '@/types';
import {
  WechatIcon,
  XiaohongshuIcon,
  ZhihuIcon,
  XIcon,
} from '@/components/icons/PlatformIcons';
import { selectorWrap, platformLabel, srOnly, selectorFooter, selectorToggleAll } from './publish.css';

const platformIconMap: Record<PlatformId, React.ComponentType<{ size?: number }>> = {
  wechat: WechatIcon,
  xiaohongshu: XiaohongshuIcon,
  zhihu: ZhihuIcon,
  x: XIcon,
};

export default function PlatformSelector() {
  const { platforms, togglePlatform, setAllPlatforms } = usePublishStore();

  const selectedCount = Object.values(platforms).filter(Boolean).length;
  const allSelected = selectedCount === PLATFORMS.length;

  return (
    <div>
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
      <div className={selectorFooter}>
        <span>{selectedCount > 0 ? `已选 ${selectedCount} 个平台` : '请选择平台'}</span>
        <button
          type="button"
          className={selectorToggleAll}
          onClick={() => setAllPlatforms(!allSelected)}
        >
          {allSelected ? '全不选' : '全选'}
        </button>
      </div>
    </div>
  );
}
