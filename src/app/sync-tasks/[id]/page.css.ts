import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const backLink = style({
  width: 'fit-content',
  color: vars.color.accent,
  fontSize: '14px',
  fontWeight: 600,
  textDecoration: 'none',
  ':hover': {
    color: vars.color.signal,
  },
});
