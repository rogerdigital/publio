import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pickerWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const label = style({
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  fontSize: 13,
  fontWeight: 500,
  color: vars.color.text,
});

export const inputRow = style({
  display: 'flex',
  gap: 8,
  alignItems: 'center',
});

export const input = style({
  flex: 1,
  padding: '6px 10px',
  fontSize: 13,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.text,
  outline: 'none',
  selectors: {
    '&:focus': {
      borderColor: vars.color.accent,
    },
  },
});

export const clearBtn = style({
  padding: '4px 10px',
  fontSize: 12,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  selectors: {
    '&:hover': {
      color: vars.color.accent,
      borderColor: vars.color.accent,
    },
  },
});
