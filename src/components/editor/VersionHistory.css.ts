import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const panel = style({
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  maxHeight: 360,
  overflowY: 'auto',
});

export const header = style({
  margin: '0 0 8px',
  fontSize: 13,
  fontWeight: 600,
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
});

export const item = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: `${vars.spacing.md} ${vars.spacing['md-lg']}`,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  cursor: 'pointer',
  transition: 'border-color 150ms',
  ':hover': {
    borderColor: vars.color.accent,
  },
});

export const dot = style({
  flexShrink: 0,
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: vars.color.accent,
  marginTop: 5,
});

export const body = style({
  flex: 1,
  minWidth: 0,
});

export const summary = style({
  margin: 0,
  fontSize: 13,
  color: vars.color.text,
  fontWeight: 500,
});

export const time = style({
  margin: '2px 0 0',
  fontSize: 11,
  color: vars.color.textMuted,
});

export const empty = style({
  fontSize: 13,
  color: vars.color.textMuted,
  textAlign: 'center',
  padding: '24px 0',
});
