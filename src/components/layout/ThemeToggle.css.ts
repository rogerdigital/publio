import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  border: 'none',
  borderRadius: '50%',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.text,
    background: vars.color.accentSoft,
  },
});

export const segmented = style({
  display: 'flex',
  alignItems: 'center',
  background: vars.color.accentSoft,
  borderRadius: '8px',
  padding: '3px',
});

export const segItem = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  border: 'none',
  borderRadius: '6px',
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  ':hover': {
    color: vars.color.text,
  },
});

export const segItemActive = style({
  background: vars.color.surface,
  color: vars.color.text,
  boxShadow: vars.shadow.sm,
  ':hover': {
    color: vars.color.text,
  },
});
