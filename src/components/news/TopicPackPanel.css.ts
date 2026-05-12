import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const container = style({
  marginTop: '12px',
  padding: '16px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.sm,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
});

export const loadingRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontSize: '13px',
  color: vars.color.textMuted,
});

export const errorRow = style({
  fontSize: '13px',
  color: vars.color.errorText,
});

export const sectionTitle = style({
  fontSize: '12px',
  fontWeight: '600',
  color: vars.color.textMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  margin: 0,
});

export const factList = style({
  listStyle: 'disc',
  paddingLeft: '18px',
  margin: 0,
  fontSize: '13px',
  lineHeight: '1.7',
  color: vars.color.text,
});

export const angleCard = style({
  padding: '8px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.borderFaint}`,
  background: vars.color.surface,
});

export const angleTitle = style({
  fontSize: '13px',
  fontWeight: '500',
  color: vars.color.text,
  margin: 0,
});

export const angleDesc = style({
  fontSize: '12px',
  color: vars.color.textMuted,
  margin: '2px 0 0',
  lineHeight: '1.5',
});

export const platformRow = style({
  display: 'flex',
  gap: '4px',
  flexWrap: 'wrap',
});

export const platformChip = style({
  fontSize: '11px',
  padding: '3px 8px',
  borderRadius: vars.radius.sm,
  background: `${vars.color.accent}12`,
  color: vars.color.accent,
});

export const sourceRow = style({
  fontSize: '12px',
  color: vars.color.textMuted,
  lineHeight: '1.6',
});

export const sourceLink = style({
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});

export const actionRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  paddingTop: '8px',
  borderTop: `1px solid ${vars.color.borderFaint}`,
});

export const saveBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  fontWeight: '500',
  padding: '6px 12px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.accent}`,
  background: vars.color.accentSoft,
  color: vars.color.accent,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  ':hover': {
    background: vars.color.accent,
    color: '#fff',
  },
});

export const dismissBtn = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '12px',
  padding: '6px 10px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  color: vars.color.textMuted,
  cursor: 'pointer',
  ':hover': {
    borderColor: vars.color.borderStrong,
    color: vars.color.text,
  },
});
