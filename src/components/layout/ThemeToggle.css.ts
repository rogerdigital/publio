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
