import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const toggle = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  background: 'transparent',
  color: vars.color.textMuted,
  cursor: 'pointer',
  transition: `all ${vars.transition.fast}`,
  position: 'relative',
  ':hover': {
    color: vars.color.text,
    borderColor: vars.color.borderStrong,
  },
});

export const dropdown = style({
  position: 'absolute',
  bottom: '100%',
  left: 0,
  marginBottom: vars.spacing.xs,
  minWidth: '140px',
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.border}`,
  background: vars.color.surface,
  boxShadow: vars.shadow.lg,
  padding: vars.spacing.xs,
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
});

export const dropdownBackdrop = style({
  position: 'fixed',
  inset: 0,
  zIndex: 99,
});

export const dropdownItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  width: '100%',
  border: 'none',
  borderRadius: vars.radius.md,
  background: 'transparent',
  padding: `${vars.spacing.md} ${vars.spacing.lg}`,
  fontSize: vars.fontSize.md,
  color: vars.color.text,
  cursor: 'pointer',
  textAlign: 'left',
  transition: `background ${vars.transition.fast}`,
  ':hover': {
    background: vars.color.bgElevated,
  },
});

export const dropdownItemActive = style({
  background: vars.color.bgElevated,
});

export const checkMark = style({
  marginLeft: 'auto',
  color: vars.color.signal,
  fontSize: vars.fontSize.md,
});

export const segmented = style({
  display: 'none',
});

export const segItem = style({
  display: 'none',
});

export const segItemActive = style({
  display: 'none',
});
