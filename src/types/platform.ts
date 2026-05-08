export type PlatformId = 'wechat' | 'xiaohongshu' | 'zhihu' | 'x';

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string;
  enabled: boolean;
}

export const PLATFORMS: Platform[] = [
  { id: 'wechat', name: '微信公众号', icon: 'MessageSquare', enabled: true },
  { id: 'xiaohongshu', name: '小红书', icon: 'BookOpen', enabled: true },
  { id: 'zhihu', name: '知乎', icon: 'GraduationCap', enabled: true },
  { id: 'x', name: 'X (Twitter)', icon: 'Twitter', enabled: true },
];
