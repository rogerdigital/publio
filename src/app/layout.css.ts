import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const skipLink = style({
  position: 'absolute',
  left: '-10000px',
  top: 'auto',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  zIndex: 100,
  padding: '8px 16px',
  background: vars.color.accent,
  color: vars.color.surfaceDarkText,
  fontSize: '14px',
  fontWeight: 600,
  borderRadius: vars.radius.lg,
  textDecoration: 'none',
  ':focus': {
    position: 'fixed',
    top: '8px',
    left: '8px',
    width: 'auto',
    height: 'auto',
    overflow: 'visible',
  },
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

export const main = style({
  minWidth: 0,
  flex: 1,
  padding: '16px',
  paddingBottom: `calc(16px + ${vars.layout.tabBarHeight} + env(safe-area-inset-bottom))`,
  animation: 'fadeIn 200ms ease-out',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '20px 24px',
      paddingBottom: `calc(20px + ${vars.layout.tabBarHeight} + env(safe-area-inset-bottom))`,
    },
    'screen and (min-width: 1024px)': {
      padding: '28px 36px',
      paddingBottom: '28px',
    },
  },
});
