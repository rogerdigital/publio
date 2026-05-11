import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const container = style({
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const headerTitle = style({
  fontSize: '12px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: vars.color.accent,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const collapseBtn = style({
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  color: vars.color.textMuted,
  ':hover': { color: vars.color.text },
});

export const sectionList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
});

export const sectionRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '8px 10px',
  borderRadius: vars.radius.md,
  background: vars.color.bgElevated,
});

export const rowLabel = style({
  fontSize: '13px',
  color: vars.color.text,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const rowCount = style({
  fontSize: '12px',
  fontWeight: 600,
  color: vars.color.accent,
  minWidth: '20px',
  textAlign: 'center',
});

export const actionLink = style({
  fontSize: '12px',
  color: vars.color.accent,
  cursor: 'pointer',
  textDecoration: 'none',
  ':hover': { textDecoration: 'underline' },
});

export const emptyRow = style({
  fontSize: '13px',
  color: vars.color.textMuted,
  textAlign: 'center',
  padding: '12px',
});
