import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const backLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  width: 'fit-content',
  color: vars.color.textMuted,
  fontSize: '13px',
  textDecoration: 'none',
  transition: 'color 150ms',
  ':hover': {
    color: vars.color.accent,
  },
});
