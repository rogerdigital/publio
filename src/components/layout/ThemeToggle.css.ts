import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.lg,
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'border-color 150ms, color 150ms',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});
