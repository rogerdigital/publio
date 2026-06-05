import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const header = style({
  width: '100%',
  paddingTop: '4px',
  paddingBottom: '16px',
  marginBottom: '8px',
});

export const inner = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '16px',
  '@media': {
    'screen and (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
  },
});

export const textBlock = style({
  maxWidth: '56rem',
  minWidth: 0,
});

export const kicker = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  letterSpacing: vars.tracking.kicker,
  color: vars.color.textMuted,
});

export const title = style({
  marginTop: '6px',
  fontSize: vars.fontSize['3xl'],
  fontWeight: 600,
  lineHeight: 1.2,
  color: vars.color.text,
});

export const description = style({
  marginTop: '8px',
  maxWidth: '48rem',
  fontSize: vars.fontSize.sm,
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const action = style({
  minWidth: 0,
  '@media': {
    'screen and (min-width: 640px)': {
      flexShrink: 0,
    },
  },
});
