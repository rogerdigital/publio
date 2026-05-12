import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

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
  paddingBottom: 'calc(16px + 57px + env(safe-area-inset-bottom))',
  animation: 'fadeIn 200ms ease-out',
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '20px 24px',
      paddingBottom: 'calc(20px + 57px + env(safe-area-inset-bottom))',
    },
    'screen and (min-width: 1024px)': {
      padding: '28px 36px',
      paddingBottom: '28px',
    },
  },
});
