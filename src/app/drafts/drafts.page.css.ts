import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const pageWrap = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

export const newDraftLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  background: vars.color.accent,
  padding: '8px 14px',
  fontSize: '14px',
  fontWeight: 500,
  color: '#ffffff',
  textDecoration: 'none',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
});

export const editToggleButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: 'transparent',
  padding: '8px 14px',
  fontSize: '14px',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: 'color 150ms, border-color 150ms',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const editCancelButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.accentSoft,
  padding: '8px 14px',
  fontSize: '14px',
  color: vars.color.accent,
  cursor: 'pointer',
});
