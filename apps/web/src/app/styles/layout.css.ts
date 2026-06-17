import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const skipLink = style({
  position: 'absolute',
  left: '-10000px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: 100,
  padding: `${vars.spacing.md} ${vars.spacing.xl}`,
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  fontSize: vars.fontSize.md,
  fontWeight: 600,
  borderRadius: vars.radius.lg,
  textDecoration: 'none',
  ':focus': {
    position: 'fixed',
    top: vars.spacing.md,
    left: vars.spacing.md,
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
  },
});

const shimmer = keyframes({
  '0%': { backgroundPosition: '100% 0' },
  '100%': { backgroundPosition: '-100% 0' },
});

export const shell = style({
  display: 'flex',
  minHeight: '100dvh',
  flexDirection: 'column',
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 1024px)': {
      flexDirection: 'row',
    },
  },
});

// main 改为定高 flex 列容器：顶部固定区(header/tabs) + 正文滚动区。
// 这样透明 header 滚动时不会被下方内容穿透（容器滚动后内容不进入 header 区域）。
export const main = style({
  minWidth: 0,
  flex: 1,
  position: 'relative',
  width: '100%',
  height: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  marginLeft: 'auto',
  marginRight: 'auto',
  '@media': {
    'screen and (min-width: 1024px)': {
      maxWidth: '920px',
    },
  },
});

// 共享滚动区：正文容器，padding 从原 main 下放至此处。
// 滚动区顶边天然紧贴 header 底边，移动端 paddingBottom 避开底部 mobileTabBar。
export const scrollArea = style({
  flex: 1,
  minWidth: 0,
  minHeight: 0,
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  padding: vars.spacing.xl,
  paddingBottom: `calc(48px + ${vars.layout.tabBarHeight} + env(safe-area-inset-bottom))`,
  '@media': {
    'screen and (min-width: 640px)': {
      padding: `${vars.spacing['2xl']} ${vars.spacing['3xl']}`,
      paddingBottom: `calc(52px + ${vars.layout.tabBarHeight} + env(safe-area-inset-bottom))`,
    },
    'screen and (min-width: 1024px)': {
      padding: '28px 36px',
      paddingBottom: '28px',
    },
  },
});

export const transitionCover = style({
  position: 'absolute',
  inset: 0,
  zIndex: 2,
  pointerEvents: 'none',
  padding: 'inherit',
  background: vars.color.bg,
});

export const transitionSkeleton = style({
  display: 'grid',
  gap: vars.spacing['3xl'],
  maxWidth: '1120px',
});

export const transitionHeader = style({
  width: 'min(42vw, 360px)',
  height: '116px',
  borderRadius: vars.radius.xl,
  background: `linear-gradient(90deg, ${vars.color.bgElevated} 0%, ${vars.color.surfaceStrong} 50%, ${vars.color.bgElevated} 100%)`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 900ms linear infinite`,
});

export const transitionBody = style({
  height: 'min(56vh, 520px)',
  borderRadius: vars.radius['2xl'],
  background: `linear-gradient(90deg, ${vars.color.bgElevated} 0%, ${vars.color.surfaceStrong} 50%, ${vars.color.bgElevated} 100%)`,
  backgroundSize: '200% 100%',
  animation: `${shimmer} 900ms linear infinite`,
});
