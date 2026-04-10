import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const header = style({
  width: '100%',
  paddingTop: '8px',
  paddingBottom: '8px',
});

export const inner = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  gap: '16px',
});

export const textBlock = style({
  maxWidth: '56rem',
});

export const kicker = style({
  fontSize: '11px',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: vars.tracking.kicker,
  color: vars.color.accent,
});

export const title = style({
  fontFamily: vars.font.serif,
  marginTop: '8px',
  fontSize: '26px',
  lineHeight: 1.3,
  color: vars.color.text,
  '@media': {
    'screen and (min-width: 640px)': {
      fontSize: '32px',
    },
  },
});

export const description = style({
  marginTop: '8px',
  maxWidth: '48rem',
  fontSize: '14px',
  lineHeight: 1.75,
  color: vars.color.textMuted,
});

export const action = style({
  flexShrink: 0,
});
