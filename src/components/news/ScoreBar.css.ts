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
  fontSize: '12px',
  color: vars.color.textMuted,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const track = style({
  flex: 1,
  height: '4px',
  background: vars.color.canvasDeep,
  borderRadius: '2px',
  overflow: 'hidden',
});

export const fill = style({
  height: '100%',
  background: vars.color.accent,
  borderRadius: '2px',
  transition: 'width 400ms ease',
});

export const value = style({
  width: '24px',
  flexShrink: 0,
  fontSize: '12px',
  textAlign: 'right',
  color: vars.color.textMuted,
});
