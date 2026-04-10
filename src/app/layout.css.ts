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
  '@media': {
    'screen and (min-width: 640px)': {
      padding: '16px 24px',
    },
    'screen and (min-width: 1024px)': {
      padding: '24px 32px',
    },
  },
});
