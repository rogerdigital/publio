import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@/app/styles/tokens.css';

export const checklist = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.lg,
});

export const step = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.md,
});

export const stepHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
});

export const stepNumber = style({
  display: 'flex',
  width: '20px',
  height: '20px',
  flexShrink: 0,
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.borderStrong}`,
  fontSize: vars.fontSize['2xs'],
  fontWeight: 700,
  color: vars.color.textMuted,
});

export const stepTitle = style({
  fontSize: vars.fontSize.xs,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.20em',
  color: vars.color.accent,
});

export const stepContent = style({
  paddingLeft: '28px',
});

export const platformRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.spacing.md,
  padding: `${vars.spacing.sm} 0`,
});

export const platformInfo = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.md,
  minWidth: 0,
});

export const platformName = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.text,
});

export const readinessVariants = styleVariants({
  ready: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    color: vars.color.successText,
  },
  'needs-content': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.warningBorder}`,
    background: vars.color.warningBg,
    color: vars.color.warningText,
  },
  'needs-adapt': {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.accentSoft,
    color: vars.color.signal,
  },
  unconfigured: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    color: vars.color.textMuted,
  },
  publishing: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.border}`,
    background: vars.color.bgElevated,
    color: vars.color.textMuted,
  },
  success: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.successBorder}`,
    background: vars.color.successBg,
    color: vars.color.successText,
  },
  failed: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: vars.spacing.xs,
    borderRadius: vars.radius.full,
    padding: `${vars.spacing['2xs']} ${vars.spacing.md}`,
    fontSize: vars.fontSize['2xs'],
    fontWeight: 500,
    border: `1px solid ${vars.color.errorBorder}`,
    background: vars.color.errorBg,
    color: vars.color.errorText,
  },
});

export const publishAction = style({
  paddingTop: vars.spacing.md,
  display: 'flex',
  alignItems: 'center',
  gap: vars.spacing.lg,
});

export const failureGuidance = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing.sm,
  marginTop: vars.spacing.lg,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.errorBorder}`,
  background: vars.color.errorBg,
  padding: vars.spacing.lg,
});

export const failureItem = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.spacing['2xs'],
});

export const failurePlatform = style({
  fontSize: vars.fontSize.sm,
  fontWeight: 600,
  color: vars.color.errorText,
});

export const failureMessage = style({
  fontSize: vars.fontSize.xs,
  color: vars.color.errorText,
  lineHeight: 1.5,
});

export const resultLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  marginTop: vars.spacing.lg,
  fontSize: vars.fontSize.sm,
  fontWeight: 500,
  color: vars.color.accent,
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});
