import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const menuOverlay = style({
  position: 'absolute',
  top: 80,
  left: 16,
  zIndex: 50,
  minWidth: 220,
  padding: 4,
  borderRadius: vars.radius.lg,
  background: vars.color.surface,
  border: `1px solid ${vars.color.border}`,
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  maxHeight: 320,
  overflowY: 'auto',
});

export const commandItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  width: '100%',
  padding: '8px 12px',
  borderRadius: vars.radius.lg,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: 14,
  color: vars.color.text,
  textAlign: 'left',
  selectors: {
    '&:hover, &[data-active="true"]': {
      background: vars.color.bgElevated,
    },
  },
});

export const commandIcon = style({
  width: 20,
  height: 20,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.accent,
  flexShrink: 0,
});

export const commandLabel = style({
  flex: 1,
});

export const commandHint = style({
  fontSize: 12,
  color: vars.color.textMuted,
});
