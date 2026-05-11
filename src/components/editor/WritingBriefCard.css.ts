import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '14px 16px',
  borderRadius: vars.radius.xl,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
});

export const header = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  cursor: 'pointer',
});

export const headerTitle = style({
  fontSize: '13px',
  fontWeight: '500',
  color: vars.color.text,
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
});

export const collapseBtn = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '20px',
  height: '20px',
  borderRadius: vars.radius.sm,
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  color: vars.color.textMuted,
});

export const body = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
});

export const field = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
});

export const fieldLabel = style({
  fontSize: '11px',
  fontWeight: '500',
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
});

export const fieldValue = style({
  fontSize: '13px',
  lineHeight: '1.5',
  color: vars.color.text,
});

export const outlineList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  paddingLeft: '12px',
});

export const outlineItem = style({
  fontSize: '12px',
  color: vars.color.text,
  lineHeight: '1.4',
  listStyleType: 'disc',
});

export const sourceList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const sourceItem = style({
  fontSize: '12px',
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

export const emptyHint = style({
  fontSize: '12px',
  color: vars.color.textMuted,
  fontStyle: 'italic',
});
