import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const row = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const label = style({
  width: '48px',
  flexShrink: 0,
  fontSize: vars.fontSize.xs,
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const track = style({
  flex: 1,
  height: '4px',
  background: vars.color.bgElevated,
  borderRadius: '2px',
  overflow: 'hidden',
});

export const fill = style({
  height: '100%',
  background: vars.color.surfaceDark,
  borderRadius: '2px',
  transition: `width ${vars.transition.slow}`,
});

export const value = style({
  width: '28px',
  flexShrink: 0,
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  textAlign: 'right',
  color: vars.color.text,
});
