import { style } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const pageWrap = style({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
});

export const headerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
});

export const newDraftLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  background: vars.color.accent,
  padding: `${vars.spacing.md} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.md,
  fontWeight: 500,
  color: vars.color.surfaceDarkText,
  textDecoration: 'none',
  transition: 'opacity 150ms',
  ':hover': {
    opacity: 0.9,
  },
});

export const editCancelButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.spacing.sm,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.accentSoft,
  padding: `${vars.spacing.md} ${vars.spacing['lg-xl']}`,
  fontSize: vars.fontSize.md,
  color: vars.color.accent,
  cursor: 'pointer',
});
